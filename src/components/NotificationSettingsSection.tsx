import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Smartphone, Laptop, ShieldCheck, 
  Trash2, Send, CheckCircle2, AlertCircle, Loader2, 
  ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';
import { 
  PushNotificationService, 
  PushPreferences, 
  PushSubscriptionRecord 
} from '../services/pushNotificationService';
import { AdminService } from '../services/adminService';
import { UserProfile } from '../types';
import { InstallPwaModal } from './InstallPwaModal';

interface NotificationSettingsSectionProps {
  currentUser: UserProfile;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  currentUser,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<PushPreferences | null>(null);
  const [devices, setDevices] = useState<PushSubscriptionRecord[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  const isAdmin = AdminService.isAdmin(currentUser);
  const isPushSupported = PushNotificationService.isPushSupported();
  const isIos = PushNotificationService.isIos();
  const isStandalone = PushNotificationService.isStandalone();

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermission(Notification.permission);
      }

      const sub = await PushNotificationService.getSubscription();
      setIsSubscribed(sub !== null);
      if (sub) {
        setCurrentEndpoint(sub.endpoint);
      } else {
        setCurrentEndpoint(null);
      }

      const prefs = await PushNotificationService.getPreferences(currentUser.id);
      setPreferences(prefs);

      const deviceList = await PushNotificationService.getRegisteredDevices(currentUser.id);
      setDevices(deviceList);
    } catch (err) {
      console.warn('[BJC Notification Settings] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStateChange = () => loadData();
    const handlePrefChange = (e: any) => {
      if (e.detail) setPreferences(e.detail);
    };

    window.addEventListener('bjc_push_state_change', handleStateChange);
    window.addEventListener('bjc_push_preferences_change', handlePrefChange);

    return () => {
      window.removeEventListener('bjc_push_state_change', handleStateChange);
      window.removeEventListener('bjc_push_preferences_change', handlePrefChange);
    };
  }, [currentUser.id]);

  // Master Push Toggle
  const handleToggleMasterPush = async () => {
    if (!isPushSupported) {
      setFeedback({
        type: 'error',
        message: 'Web Push notifications are not supported on this browser or platform.',
      });
      return;
    }

    // On iOS Safari outside PWA, open iOS Installation Guide modal
    if (isIos && !isStandalone) {
      setIsPwaModalOpen(true);
      return;
    }

    if (!isSubscribed) {
      // User is enabling push for this device
      setIsSavingPref(true);
      const res = await PushNotificationService.subscribe(currentUser);
      setIsSavingPref(false);

      if (res.success) {
        setIsSubscribed(true);
        setFeedback({
          type: 'success',
          message: '🔔 Push notifications enabled! This device will now receive real-time alerts.',
        });
        await loadData();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to activate push notifications.',
        });
      }
    } else {
      // Toggle master preference on server
      if (!preferences) return;
      const nextEnabled = !preferences.pushEnabled;
      setIsSavingPref(true);
      const success = await PushNotificationService.updatePreferences(currentUser.id, {
        pushEnabled: nextEnabled,
      });
      setIsSavingPref(false);

      if (success) {
        setPreferences((prev) => (prev ? { ...prev, pushEnabled: nextEnabled } : prev));
        setFeedback({
          type: 'success',
          message: nextEnabled
            ? '🔔 Push notifications turned ON.'
            : '🔕 Push notifications muted for your account.',
        });
      }
    }
  };

  // Category Toggle
  const handleToggleCategory = async (key: keyof PushPreferences['categories']) => {
    if (!preferences) return;
    const currentVal = preferences.categories[key];
    const newCategories = {
      ...preferences.categories,
      [key]: !currentVal,
    };

    setIsSavingPref(true);
    const success = await PushNotificationService.updatePreferences(currentUser.id, {
      categories: newCategories,
    });
    setIsSavingPref(false);

    if (success) {
      setPreferences((prev) => (prev ? { ...prev, categories: newCategories } : prev));
    } else {
      setFeedback({
        type: 'error',
        message: 'Failed to save notification preference to server.',
      });
    }
  };

  // Send Test Notification
  const handleSendTest = async () => {
    if (!isSubscribed) {
      if (isIos && !isStandalone) {
        setIsPwaModalOpen(true);
      } else {
        setFeedback({
          type: 'error',
          message: 'Please enable push notifications first to test.',
        });
      }
      return;
    }

    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await PushNotificationService.sendTestPush(currentUser);
      setFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to trigger test notification.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Remove / Unsubscribe Device
  const handleRemoveDevice = async (subId: string, endpoint: string) => {
    const isCurrentDevice = endpoint === currentEndpoint;
    const confirmMsg = isCurrentDevice
      ? 'Are you sure you want to unsubscribe this current device from push alerts?'
      : 'Remove this registered device from your notifications?';

    if (!window.confirm(confirmMsg)) return;

    if (isCurrentDevice) {
      await PushNotificationService.unsubscribe(currentUser);
      setIsSubscribed(false);
    } else {
      await PushNotificationService.removeDeviceSubscription(subId);
    }

    setFeedback({
      type: 'success',
      message: 'Device subscription removed successfully.',
    });
    await loadData();
  };

  return (
    <div
      id="web-push-settings"
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6 scroll-mt-24 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 dark:bg-gold/20 flex items-center justify-center text-gold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              Web Push Notification Settings
              {isSubscribed && preferences?.pushEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive real-time church fellowship alerts, prayer requests, and event reminders.
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadData}
          disabled={isLoading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          title="Refresh device subscription status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Device Status Card */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            {PushNotificationService.getPlatform() === 'ios' ? (
              <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : PushNotificationService.getPlatform() === 'android' ? (
              <Smartphone className="w-4 h-4 text-emerald-500" />
            ) : (
              <Laptop className="w-4 h-4 text-blue-500" />
            )}
            Current Device: {PushNotificationService.getDeviceName()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Status:</span>
            {!isPushSupported ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Not Supported in this Browser</span>
            ) : permission === 'denied' ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">Blocked / Denied in Browser Settings</span>
            ) : isSubscribed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Registered & Subscribed</span>
            ) : (
              <span className="text-slate-500 font-medium">Not Subscribed Yet</span>
            )}
          </div>
        </div>

        {/* Action Controls for this device */}
        <div className="flex items-center gap-2">
          {isIos && !isStandalone && (
            <button
              onClick={() => setIsPwaModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              iOS Guide
            </button>
          )}

          {!isSubscribed ? (
            <button
              onClick={handleToggleMasterPush}
              disabled={isSavingPref}
              className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs shadow-soft transition flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              {isSavingPref ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
              Enable Push Notifications
            </button>
          ) : (
            <>
              <button
                onClick={handleSendTest}
                disabled={isTesting}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-gold hover:text-slate-950 font-bold text-[11px] text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                title="Send test push to this device"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Test Notification
              </button>
              <button
                onClick={() => handleRemoveDevice('', currentEndpoint || '')}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-medium transition cursor-pointer"
                title="Unsubscribe this device"
              >
                Unsubscribe
              </button>
            </>
          )}
        </div>
      </div>

      {/* iOS Special Notification Card if needed */}
      {isIos && !isStandalone && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Smartphone className="w-4 h-4" /> iPhone & iPad Home Screen Requirement
          </div>
          <p className="text-[11px] leading-relaxed">
            iOS 16.4+ requires adding BJC to your Home Screen to deliver push notifications when the app is closed.
            Tap <strong>Share</strong> in Safari, then select <strong>Add to Home Screen</strong>.
          </p>
          <button
            onClick={() => setIsPwaModalOpen(true)}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            View Step-by-Step Instructions →
          </button>
        </div>
      )}

      {/* Master Push Toggle Switch */}
      <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {preferences?.pushEnabled && isSubscribed ? (
              <Bell className="w-4 h-4 text-gold" />
            ) : (
              <BellOff className="w-4 h-4 text-slate-400" />
            )}
            Push Notifications
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs">
            {isSubscribed
              ? preferences?.pushEnabled
                ? 'Active — You will receive real-time notifications on this device.'
                : 'Muted — Notifications temporarily silenced on your account.'
              : 'Turn on to receive notifications even when the app is closed.'}
          </div>
        </div>

        <button
          onClick={handleToggleMasterPush}
          disabled={isSavingPref}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isSubscribed && preferences?.pushEnabled
              ? 'bg-gold'
              : 'bg-slate-300 dark:bg-slate-700'
          }`}
          role="switch"
          aria-checked={isSubscribed && Boolean(preferences?.pushEnabled)}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isSubscribed && preferences?.pushEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Category Preferences (Enforced Server-Side) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-400">
            Notification Categories
          </h3>
          <span className="text-[10px] text-slate-400">Enforced by Church Server</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          {/* Community Feed */}
          <div className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition">
            <div className="pr-4">
              <div className="font-semibold text-slate-900 dark:text-white">Community Feed</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                Likes, comments, replies, mentions, and prayer request responses.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences?.categories.feed ?? true}
              onChange={() => handleToggleCategory('feed')}
              disabled={isSavingPref}
              className="accent-gold w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Fellowship and Direct Messages */}
          <div className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition">
            <div className="pr-4">
              <div className="font-semibold text-slate-900 dark:text-white">Fellowship & Direct Messages</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                Private chats, group messages, group chat invitations, and chat mentions.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences?.categories.chat ?? true}
              onChange={() => handleToggleCategory('chat')}
              disabled={isSavingPref}
              className="accent-gold w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Church Events */}
          <div className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition">
            <div className="pr-4">
              <div className="font-semibold text-slate-900 dark:text-white">Church Events</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                New church events, schedule changes, reminders, and cancellations.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences?.categories.events ?? true}
              onChange={() => handleToggleCategory('events')}
              disabled={isSavingPref}
              className="accent-gold w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Announcements */}
          <div className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition">
            <div className="pr-4">
              <div className="font-semibold text-slate-900 dark:text-white">Announcements</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                Church-wide updates and high-priority pastoral broadcasts.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences?.categories.announcements ?? true}
              onChange={() => handleToggleCategory('announcements')}
              disabled={isSavingPref}
              className="accent-gold w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Ministries */}
          <div className="p-3.5 sm:px-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition">
            <div className="pr-4">
              <div className="font-semibold text-slate-900 dark:text-white">Ministry Updates</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                Announcements, activity updates, and schedule shifts for your ministries.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences?.categories.ministries ?? true}
              onChange={() => handleToggleCategory('ministries')}
              disabled={isSavingPref}
              className="accent-gold w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Admin Notifications (Authorized Administrators Only) */}
          {isAdmin && (
            <div className="p-3.5 sm:px-4 flex items-center justify-between bg-gold/5 dark:bg-gold/10 hover:bg-gold/10 dark:hover:bg-gold/15 transition border-t border-gold/20">
              <div className="pr-4">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                  Admin Alerts (Authorized Admins Only)
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  New admin applications, applicant approvals, and administrative system alerts.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences?.categories.admin ?? true}
                onChange={() => handleToggleCategory('admin')}
                disabled={isSavingPref}
                className="accent-gold w-4 h-4 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Registered Devices List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-400">
            Registered Devices ({devices.length})
          </h3>
          <span className="text-[10px] text-slate-400">Multi-Device Web Push</span>
        </div>

        {devices.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No devices are currently registered. Tap "Enable Push Notifications" to subscribe this device.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-xs">
            {devices.map((dev) => {
              const isThisDevice = dev.endpoint === currentEndpoint;
              return (
                <div
                  key={dev.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      {dev.platform === 'ios' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : dev.platform === 'android' ? (
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Laptop className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                        {dev.deviceName}
                        {isThisDevice && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gold/20 text-gold-dark dark:text-gold shrink-0">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Registered {new Date(dev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDevice(dev.id, dev.endpoint)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                    title={isThisDevice ? 'Unsubscribe this device' : 'Remove this device'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* iOS Modal */}
      <InstallPwaModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        currentUser={currentUser}
        onSubscriptionSuccess={() => {
          setIsSubscribed(true);
          loadData();
        }}
      />
    </div>
  );
};
