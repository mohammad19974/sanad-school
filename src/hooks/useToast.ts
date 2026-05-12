// hook موحّد لإظهار رسائل toast عربية مع ألوان معبّرة
// يغلّف useIonToast من Ionic لتوحيد الأسلوب عبر التطبيق

import { useCallback } from 'react';
import { useIonToast } from '@ionic/react';

type Tone = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
}

// لون Ionic لكل نبرة
const toneColor: Record<Tone, string> = {
  success: 'success',
  error:   'danger',
  warning: 'warning',
  info:    'primary',
};

// أيقونة emoji قبل الرسالة لتعزيز الفهم البصري السريع
const toneIcon: Record<Tone, string> = {
  success: '✅',
  error:   '⚠️',
  warning: '⚠️',
  info:    'ℹ️',
};

export const useToast = () => {
  const [present] = useIonToast();

  const show = useCallback((
    tone: Tone, message: string, options: ToastOptions = {},
  ) => {
    present({
      message: `${toneIcon[tone]}  ${message}`,
      duration: options.duration ?? 2200,
      position: options.position ?? 'bottom',
      color: toneColor[tone],
      cssClass: 'sanad-toast',
      // محاذاة عربية
      htmlAttributes: { dir: 'rtl' } as Record<string, string>,
    });
  }, [present]);

  return {
    success: (msg: string, opt?: ToastOptions) => show('success', msg, opt),
    error:   (msg: string, opt?: ToastOptions) => show('error',   msg, opt),
    info:    (msg: string, opt?: ToastOptions) => show('info',    msg, opt),
    warning: (msg: string, opt?: ToastOptions) => show('warning', msg, opt),
  };
};
