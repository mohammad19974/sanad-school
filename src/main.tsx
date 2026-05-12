// نقطة الدخول — يُمرّر React إلى DOM

import React from 'react';
import ReactDOM from 'react-dom/client';

// أنماط Ionic الأساسية — مطلوبة
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// أنماط التطبيق
import './theme/global.css';

import App from './App';

// تسجيل Service Worker — لازم لإشعارات المتصفّح وللعمل offline
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.info('[Sanad] SW مُسجَّل', reg.scope))
      .catch((err) => console.warn('[Sanad] فشل تسجيل SW:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
