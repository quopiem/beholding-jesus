import React from 'react';
import { Share, PlusSquare, Smartphone, Bell, X, CheckCircle2 } from 'lucide-react';
import { PushNotificationService } from '../services/pushNotificationService';
import { UserProfile } from '../types';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onSubscriptionSuccess?: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubscriptionSuccess,
}) => {
  if (!isOpen) return null;

  const isStandalone = PushNotificationService.isStandalone();
  const isIos = PushNotificationService.isIos();

  const handleEnablePush = async () => {
    if (!currentUser) return;
    const res = await PushNotificationService.subscribe(currentUser);
    if (res.success) {
      if (onSubscriptionSuccess) onSubscriptionSuccess();
      onClose();
    } else {
      alert(res.error || 'Failed to enable notifications.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 dark:bg-gold/25 flex items-center justify-center text-gold">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
              {isStandalone ? 'Enable Lock Screen Alerts' : 'Install BJC on iPhone / iPad'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Web Push Notifications for iOS 16.4+
            </p>
          </div>
        </div>

        {/* Content depending on whether in standalone PWA or in Safari browser */}
        {isIos && !isStandalone ? (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed">
              Apple requires web apps to be installed to your Home Screen before lock screen and background notifications can be activated.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-dark dark:text-gold flex items-center justify-center font-bold shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Tap the Share Button <Share className="w-3.5 h-3.5 text-blue-500 inline" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    At the bottom of your Safari screen (or top on iPad).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-dark dark:text-gold flex items-center justify-center font-bold shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-500 inline" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scroll down the share sheet options and tap "Add".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-dark dark:text-gold flex items-center justify-center font-bold shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Open BJC & Tap "Enable Notifications" <Bell className="w-3.5 h-3.5 text-gold inline" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Launch the app from your Home Screen icon to activate push notifications.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-95 transition shadow-soft flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              I Understand — Add to Home Screen
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed">
              Praise God! Your device is ready. Tap the button below to allow Beholding Jesus Church to send real-time fellowship updates, prayer requests, and church announcements.
            </p>

            <button
              onClick={handleEnablePush}
              className="w-full py-3 rounded-2xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs transition shadow-soft flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              Enable Push Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
