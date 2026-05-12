// شريط طلب إذن الإشعارات — يظهر للمنسّق إذا لم يفعّلها بعد

import type { FC } from 'react';
import { colors, fontFamily } from '../../theme/tokens';
import { useWebNotifications } from '../../hooks/useWebNotifications';

export const NotificationPermissionBanner: FC = () => {
  const { permission, isSupported, request } = useWebNotifications();

  if (!isSupported || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <div
      style={{
        margin: '10px 12px',
        padding: '12px 14px',
        borderRadius: 14,
        background: `${colors.accent}15`,
        border: `1.5px solid ${colors.accent}40`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily,
      }}
    >
      <div style={{ fontSize: 28 }}>🔔</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
          فعّل إشعارات النظام
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
          ليصلك تنبيه فور وصول طلب نجدة جديد — حتى لو كان التطبيق في الخلفية
        </div>
      </div>
      <button
        onClick={() => request()}
        style={{
          padding: '8px 14px',
          borderRadius: 12,
          background: colors.accent,
          color: colors.white,
          border: 'none',
          fontFamily,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        تفعيل
      </button>
    </div>
  );
};
