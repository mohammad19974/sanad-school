// شاشة افتتاح — تُعرض أثناء تحميل المصادقة

import type { FC } from 'react';
import { Icon } from '../ui/Icon';
import { PulseRing } from '../ui/PulseRing';
import { colors, fontFamily } from '../theme/tokens';

export const SplashScreen: FC = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily, direction: 'rtl',
  }}>
    {/* الشعار مع حلقات نابضة */}
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 24,
    }}>
      <PulseRing baseSize={100} rings={3} />
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: colors.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        animation: 'breathe 3s ease-in-out infinite',
      }}>
        <Icon name="shield" size={52} color={colors.primary} />
      </div>
    </div>

    {/* الاسم */}
    <div style={{
      fontSize: 36, fontWeight: 800, color: colors.white, marginBottom: 6,
    }}>سند</div>

    {/* الشعار */}
    <div style={{
      fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 40,
    }}>
      الطوارئ المدرسية في متناول يدك
    </div>

    {/* مؤشّر تحميل */}
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            animation: `breathe 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>

    {/* النسخة */}
    <div style={{
      position: 'absolute', bottom: 28,
      fontSize: 11, color: 'rgba(255,255,255,0.55)',
    }}>الإصدار 1.0</div>
  </div>
);
