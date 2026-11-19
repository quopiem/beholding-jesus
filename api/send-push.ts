import * as webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rpeevqhwwbqixuaxhsot.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_kHVMAKw9XSrvQ69xIH2gmw_9RcvlYO6';

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BNgC0wpK1EQoeeYg0b-f0_OzNRAVSq6ynFNjvyXGfsSEfUxJkFAn_R0scnytEyoORrRvvUrENi6NwbsLyPrWJ2Q';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'NgRG-8j32Lewl2jfyhpkspQhj-_6zhcNxy4k_sDqoaU';
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:notifications@beholdingjesus.org';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req: any, res: any) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        // ignore parse error
      }
    }

    const { title, body, url, user_id, category, notification_id } = bodyData || {};

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required.' });
    }

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // 1. Fetch registered device subscriptions (target user or broadcast to all)
    let query = supabase.from('push_subscriptions').select('*');
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error('[BJC Push] Failed to query push_subscriptions:', subError);
      return res.status(500).json({
        error: 'Database error fetching subscriptions',
        details: subError.message,
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No push subscriptions currently registered.',
        sentCount: 0,
        sent_count: 0,
        failedCount: 0,
        failed_count: 0,
        total: 0,
      });
    }

    // 2. Construct Web Push payload
    const pushPayload = JSON.stringify({
      title: title,
      body: body,
      url: url || '/',
      category: category || 'announcements',
      notification_id: notification_id || `push-${Date.now()}`,
    });

    let sentCount = 0;
    let failedCount = 0;
    const pruneEndpoints: string[] = [];

    // 3. Dispatch to devices in parallel via Promise.allSettled
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          pushPayload,
          {
            TTL: 86400, // 24 hours
          }
        );
        sentCount++;
      } catch (err: any) {
        failedCount++;
        console.warn(
          `[BJC Push] Push failed for endpoint ${sub.endpoint.slice(0, 30)}...:`,
          err?.message || err
        );
        // If Apple APNs / Google FCM reports endpoint is dead (404 or 410 Gone)
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          pruneEndpoints.push(sub.endpoint);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // 4. Prune dead subscriptions in background
    if (pruneEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', pruneEndpoints);
    }

    return res.status(200).json({
      success: true,
      sentCount,
      sent_count: sentCount,
      failedCount,
      failed_count: failedCount,
      total: subscriptions.length,
    });
  } catch (err: any) {
    console.error('[BJC Push] send-push handler exception:', err);
    return res.status(500).json({
      error: 'Internal push dispatch error',
      details: err?.message || 'Unknown error',
    });
  }
}
