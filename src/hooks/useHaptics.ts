// hook بسيط لاستدعاء الاهتزاز عبر Capacitor + fallback في المتصفّح

import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

type Strength = 'light' | 'medium' | 'heavy';

const styleMap: Record<Strength, ImpactStyle> = {
  light:  ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy:  ImpactStyle.Heavy,
};

export const useHaptics = () => {
  /** اهتزاز قصير عند الضغط */
  const impact = useCallback(async (strength: Strength = 'medium') => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: styleMap[strength] });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(strength === 'heavy' ? 80 : strength === 'medium' ? 40 : 20);
      }
    } catch {
      /* تجاهل، الاهتزاز ميزة ثانوية */
    }
  }, []);

  /** اهتزاز نجاح (مفيد عند إرسال SOS) */
  const success = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if ('vibrate' in navigator) {
        navigator.vibrate([40, 40, 40]);
      }
    } catch { /* noop */ }
  }, []);

  return { impact, success };
};
