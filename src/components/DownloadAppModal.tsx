import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Download, X, Check, Share, PlusSquare, 
  ExternalLink, Sparkles, Shield, ArrowRight, CheckCircle2,
  QrCode, Image as ImageIcon
} from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'qr' | 'ios' | 'android'>('qr');
  const [isStandalone, setIsStandalone] = useState(false);
  const [canPromptInstall, setCanPromptInstall] = useState(false);

  useEffect(() => {
    // Detect device type and OS
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/i.test(userAgent) || window.innerWidth < 768;
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      
      if (isMobile) {
        setPlatform(isIOSDevice ? 'ios' : 'android');
      } else {
        setPlatform('qr');
      }

      // Check if already installed as PWA standalone
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!isStandaloneMode);

      // Check for native install prompt
      if ((window as any).deferredInstallPrompt) {
        setCanPromptInstall(true);
      }
    }

    const handlePromptReady = () => setCanPromptInstall(true);
    window.addEventListener('bjc_install_prompt_ready', handlePromptReady);
    return () => window.removeEventListener('bjc_install_prompt_ready', handlePromptReady);
  }, []);

  if (!isOpen) return null;

  const handleDownloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeInstall = async () => {
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        (window as any).deferredInstallPrompt = null;
        setCanPromptInstall(false);
        onClose();
      }
    } else {
      alert("Follow the steps below to add Beholding Jesus Church directly to your home screen!");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#111c2e] via-[#1a283e] to-[#0f172a] text-white flex items-center justify-between border-b border-slate-800 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6CA92] via-[#C5A46D] to-[#99793D] p-0.5 shadow-md shrink-0">
              <img 
                src="/icons/church-logo.png" 
                alt="BJC Logo" 
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-base text-white tracking-wide">
                  Install BJC App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Mobile PWA
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                Fast, offline-ready & lock screen notifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Switch (QR / Android / iOS) */}
        <div className="p-3 bg-stone-100 dark:bg-slate-800/60 border-b border-stone-200 dark:border-slate-800 flex gap-1.5">
          <button
            onClick={() => setPlatform('qr')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'qr'
                ? 'bg-gradient-to-r from-gold to-amber-300 text-slate-950 shadow-soft font-black'
                : 'bg-white dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'android'
                ? 'bg-[#1E293B] text-white shadow-soft'
                : 'bg-white dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              platform === 'ios'
                ? 'bg-[#1E293B] text-white shadow-soft'
                : 'bg-white dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>iPhone</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {isStandalone && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Great news! You are already running the installed BJC App.</span>
            </div>
          )}

          {/* QR Code Section */}
          {platform === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-3xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700 flex flex-col items-center">
                {/* QR Image Box */}
                <div className="w-56 h-56 sm:w-60 sm:h-60 rounded-2xl overflow-hidden bg-white p-2.5 border-2 border-gold/40 shadow-md">
                  <img 
                    src="/images/bjc-app-qr-code.png" 
                    alt="Beholding Jesus Church App QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    Scan with Your Phone Camera
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                    Opens directly in Safari or Chrome to install without App Store
                  </p>
                </div>

                <div className="mt-2.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-gold/30 text-gold-dark dark:text-gold text-[11px] font-mono font-bold">
                  beholding-jesus.netlify.app
                </div>
              </div>

              {/* Download Photo Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadImage('/images/bjc-app-qr-code.png', 'bjc-app-qr-code.png')}
                  className="py-2.5 px-3 rounded-xl bg-gold hover:bg-gold-dark text-slate-950 font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadImage('/images/bjc-download-app-poster.png', 'bjc-download-app-poster.png')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-gold" />
                  <span>Save Full Poster</span>
                </button>
              </div>
            </div>
          )}

          {/* Android Section */}
          {platform === 'android' && (
            <div className="space-y-4">
              
              {canPromptInstall ? (
                <div className="text-center space-y-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    Ready for 1-Tap Installation on your phone!
                  </p>
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Now on Home Screen</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600 dark:text-slate-300 font-medium leading-relaxed">
                    Install Beholding Jesus Church directly from Google Chrome with zero App Store downloads:
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="text-stone-700 dark:text-slate-200 leading-normal">
                        Open this page in <strong>Google Chrome</strong> or your default mobile browser.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="text-stone-700 dark:text-slate-200 leading-normal">
                        Tap the <strong>three vertical dots (⋮)</strong> in the top-right corner of Chrome.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="text-stone-700 dark:text-slate-200 leading-normal">
                        Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] leading-relaxed">
                ✨ The BJC Church icon will instantly appear on your mobile home screen and app drawer, functioning exactly like a native app.
              </div>
            </div>
          )}

          {/* iOS Section */}
          {platform === 'ios' && (
            <div className="space-y-3">
              <p className="text-stone-600 dark:text-slate-300 font-medium leading-relaxed">
                Follow these simple steps in <strong>Apple Safari</strong> on your iPhone or iPad:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-stone-700 dark:text-slate-200 leading-normal">
                    Open this website in <strong>Safari</strong> on your iPhone or iPad.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-stone-700 dark:text-slate-200 leading-normal flex items-center gap-1.5 flex-wrap">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-200 dark:bg-slate-700 font-bold text-[11px]">
                      <Share className="w-3 h-3 text-sky-500" />
                      <span>Share button</span>
                    </span>
                    <span>at the bottom of the screen.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-stone-700 dark:text-slate-200 leading-normal flex items-center gap-1.5 flex-wrap">
                    <span>Scroll down and tap</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-200 dark:bg-slate-700 font-bold text-[11px]">
                      <PlusSquare className="w-3 h-3 text-emerald-500" />
                      <span>Add to Home Screen</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/70 border border-stone-200/80 dark:border-slate-700">
                  <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="text-stone-700 dark:text-slate-200 leading-normal">
                    Tap <strong>"Add"</strong> in the top-right corner to finish.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] leading-relaxed">
                📱 The BJC icon will now sit on your iPhone home screen, launching full-screen without Safari browser bars!
              </div>
            </div>
          )}

          {/* Quick toggle to QR view for printing or sharing */}
          {platform !== 'qr' && (
            <button
              type="button"
              onClick={() => setPlatform('qr')}
              className="w-full py-2.5 px-3 rounded-2xl bg-gold/10 hover:bg-gold/20 text-gold-dark dark:text-gold border border-gold/30 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>View &amp; Save QR Code Photo</span>
            </button>
          )}

          {/* Benefits */}
          <div className="pt-2 border-t border-stone-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-stone-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-gold" />
              <span>Full Screen Experience</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-gold" />
              <span>Lock Screen Alerts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-gold" />
              <span>No App Store needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-gold" />
              <span>Instant auto-updates</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-slate-800/60 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">Beholding Jesus Church PWA</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
