import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { NotificationService } from './services/notificationService'
import { StorageManager } from './services/storageManager'

// Proactively purge old version caches and transient bloat to prevent QuotaExceededError
StorageManager.cleanLegacyAndHeavyCaches();

// Initialize Service Worker for Lock Screen / Home Screen Notifications
NotificationService.init();

// Capture native PWA installation event for Android / Chrome / Edge
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('bjc_install_prompt_ready'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
