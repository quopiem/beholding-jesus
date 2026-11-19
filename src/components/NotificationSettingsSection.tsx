import React, { useState, useEffect } from 'react';
import { 
  Bell, BellOff, Smartphone, Laptop, ShieldCheck, 
  Trash2, Send, CheckCircle2, AlertCircle, Loader2, 
  ExternalLink, Sparkles, RefreshCw, Zap, Info,
  ChevronDown, ChevronUp, Share, PlusSquare, Lock
} from 'lucide-react';
import { 
  PushNotificationService, 
  PushPreferences, 
  PushSubscriptionRecord,
  IOSSupportStatus
} from '../services/pushNotificationService';
import { AdminService } from '../services/adminService';
import { UserProfile } from '../types';
import { InstallPwaModal } from './InstallPwaModal';

export type PushDeviceStatus =
  | 'unsupported'                 // Unsupported device/browser
  | 'permission_not_requested'    // Permission not requested (permission === 'default' && !isSubscribed)
  | 'permission_denied'           // Permission denied in browser settings
  | 'granted_unregistered'        // Permission granted in browser, but subscription missing in database
  | 'registering'                 // Registering subscription (in progress)
  | 'subscribed'                  // Successfully subscribed (permission === 'granted' && isSubscribed)
  | 'expired_invalid'             // Subscription expired or invalid
  | 'not_enabled';                // Subscribed on device, but muted in user account preferences

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
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const isAdmin = AdminService.isAdmin(currentUser);
  const isPushSupported = PushNotificationService.isPushSupported();
  const isIos = PushNotificationService.isIos();
  const isStandalone = PushNotificationService.isStandalone();
  const iosStatus: IOSSupportStatus = PushNotificationService.getIOSSupportStatus();

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

  // Compute the exact device notification status among the 8 required states
  const computeDeviceStatus = (): PushDeviceStatus => {
    if (isRegistering) return 'registering';
    if (!isPushSupported) return 'unsupported';
    if (permission === 'denied') return 'permission_denied';
    if (isSubscribed) {
      if (preferences && preferences.pushEnabled === false) return 'not_enabled';
      return 'subscribed';
    }
    if (permission === 'granted') return 'granted_unregistered';
    return 'permission_not_requested';
  };

  const deviceStatus = computeDeviceStatus();

  // Primary Enable Push Flow (Full Browser Permission & Push Subscription Lifecycle)
  const handleEnablePush = async () => {
    // 1. Check browser push capability
    if (!isPushSupported) {
      setFeedback({
        type: 'error',
        message: 'Web Push notifications are not supported on this browser or platform.',
      });
      return;
    }

    // 2. Check iOS standalone mode requirement
    if (isIos && !isStandalone) {
      setIsPwaModalOpen(true);
      setIsGuideOpen(true);
      setFeedback({
        type: 'info',
        message: 'Apple requires adding BJC to your Home Screen from Safari first, then launching it from your Home Screen to enable notifications.',
      });
      return;
    }

    // 3. Check current permission value
    const currentPerm = typeof Notification !== 'undefined' ? Notification.permission : 'default';
    if (currentPerm === 'denied') {
      setPermission('denied');
      setFeedback({
        type: 'error',
        message: 'Notification permission is blocked. Please allow notifications in your browser or device settings.',
      });
      return;
    }

    setIsRegistering(true);
    setFeedback(null);

    try {
      // 4. Request user permission directly in click gesture and complete subscription
      const res = await PushNotificationService.subscribe(currentUser);

      if (res.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setFeedback({
          type: 'success',
          message: '🔔 Web Push notifications are now active! You will receive alerts even when BJC is closed.',
        });
        await loadData();
      } else {
        setIsSubscribed(false);
        if (res.status === 'permission_denied') {
          setPermission('denied');
        }
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to activate push notifications.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Unexpected error activating push notifications.',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Master Push Toggle Handler (Never switches ON without registered subscription)
  const handleToggleMasterPush = async () => {
    if (!isSubscribed) {
      // If not yet subscribed, tapping the toggle initiates the full subscription lifecycle!
      await handleEnablePush();
      return;
    }

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
    } else {
      setFeedback({
        type: 'error',
        message: 'Failed to update notification preferences on the server.',
      });
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
      ? 'Are you sure you want to turn off notifications for this device?'
      : 'Remove this registered device from your notifications?';

    if (!window.confirm(confirmMsg)) return;

    if (isCurrentDevice) {
      await PushNotificationService.unsubscribe(currentUser);
      setIsSubscribed(false);
    } else {
      await PushNotificationService.removeDeviceSubscription(subId);
    }

    setFeedback({
      type: 'info',
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
              {deviceStatus === 'subscribed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive real-time church fellowship alerts, prayer requests, and event reminders when BJC is closed.
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadData}
          disabled={isLoading || isRegistering}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
              : feedback.type === 'info'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : feedback.type === 'info' ? (
              <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* PRIMARY ACTION CARD (Distinguishing all 8 lifecycle states) */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              {PushNotificationService.getPlatform() === 'ios' ? (
                <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              ) : PushNotificationService.getPlatform() === 'android' ? (
                <Smartphone className="w-4 h-4 text-emerald-500" />
              ) : (
                <Laptop className="w-4 h-4 text-blue-500" />
              )}
              Current Device: {PushNotificationService.getDeviceName()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {deviceStatus === 'subscribed' && 'Notifications are active and configured to wake your device.'}
              {deviceStatus === 'permission_not_requested' && 'Browser notification permission has not been requested yet.'}
              {deviceStatus === 'permission_denied' && 'Notifications are blocked in your browser site permissions.'}
              {deviceStatus === 'granted_unregistered' && 'Permission allowed, but device subscription is not yet registered.'}
              {deviceStatus === 'not_enabled' && 'Device registered, but alerts are temporarily muted on your account.'}
              {deviceStatus === 'unsupported' && 'Web Push is not supported in this browser version.'}
              {deviceStatus === 'registering' && 'Registering service worker and acquiring push subscription...'}
              {deviceStatus === 'expired_invalid' && 'Push subscription expired or endpoint revoked. Renewal needed.'}
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {deviceStatus === 'subscribed' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Active & Subscribed
              </span>
            )}
            {deviceStatus === 'permission_not_requested' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Permission Not Requested
              </span>
            )}
            {deviceStatus === 'permission_denied' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Permission Denied
              </span>
            )}
            {deviceStatus === 'granted_unregistered' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Subscription Pending
              </span>
            )}
            {deviceStatus === 'not_enabled' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <BellOff className="w-3.5 h-3.5 text-amber-600" />
                Muted on Account
              </span>
            )}
            {deviceStatus === 'registering' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Registering...
              </span>
            )}
            {deviceStatus === 'unsupported' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                Unsupported Browser
              </span>
            )}
            {deviceStatus === 'expired_invalid' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                Subscription Expired
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2">
          {deviceStatus === 'subscribed' ? (
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleSendTest}
                disabled={isTesting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gold hover:bg-[#b08e57] text-slate-950 font-bold text-xs shadow-soft transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                title="Send a real Web Push alert to this device"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Test Notification to this Device</span>
              </button>

              <button
                onClick={() => handleRemoveDevice('', currentEndpoint || '')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition cursor-pointer"
                title="Unsubscribe this device"
              >
                Turn Off Notifications on this Device
              </button>
            </div>
          ) : deviceStatus === 'permission_denied' ? (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" />
                How to Unblock Notifications in Browser
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-[11px] text-rose-700 dark:text-rose-300">
                <li>Click the <strong>Padlock / Site Settings icon</strong> in your browser's address bar (left of the URL).</li>
                <li>Find <strong>Notifications</strong> and change the dropdown from <em>Block</em> to <em>Allow</em>.</li>
                <li>Refresh this page, then tap <strong>Enable Web Push Notifications</strong> below.</li>
              </ol>
              <button
                onClick={handleEnablePush}
                disabled={isRegistering}
                className="mt-2 px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Re-check Permission & Enable
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleEnablePush}
                disabled={isRegistering || !isPushSupported}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gold hover:bg-gold-light text-slate-950 font-black text-xs sm:text-sm shadow-soft transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Push Notifications...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>
                      {deviceStatus === 'granted_unregistered'
                        ? 'Complete Device Registration'
                        : 'Enable Web Push Notifications'}
                    </span>
                  </>
                )}
              </button>

              {isIos && !isStandalone && (
                <button
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-gold" />
                  <span>iOS Home Screen Guide</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* iPhone & iPad Home Screen Guide (Collapsible Accordion) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              iPhone & iPad Setup Guide (iOS 16.4+)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-full">
              {isGuideOpen ? 'Hide Steps' : 'View Instructions'}
            </span>
            {isGuideOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {isGuideOpen && (
          <div className="p-4 sm:p-5 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              <strong className="text-amber-800 dark:text-amber-300">Apple Requirement:</strong> On iPhone and iPad, Apple Web Push operates through Home Screen web apps. You must add BJC to your Home Screen from Safari.
            </div>

            <ol className="space-y-3 pl-1 font-medium">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Open this BJC website in <strong className="text-slate-900 dark:text-white">Safari</strong> on your iPhone or iPad.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-gold" /> in the bottom Safari toolbar.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Scroll down and tap <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-gold" />, then tap <strong className="text-slate-900 dark:text-white">Add</strong> in the top right.
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  Go to your iPhone Home Screen, open the newly installed <strong className="text-slate-900 dark:text-white">BJC</strong> app icon, and tap <strong>Enable Web Push Notifications</strong>!
                </span>
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Master Push Toggle Switch */}
      <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {isSubscribed && preferences?.pushEnabled ? (
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
              : 'Tap to request browser permission and enable alerts when closed.'}
          </div>
        </div>

        <button
          onClick={handleToggleMasterPush}
          disabled={isSavingPref || isRegistering}
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
            No devices are currently registered. Tap "Enable Web Push Notifications" to subscribe this device.
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
