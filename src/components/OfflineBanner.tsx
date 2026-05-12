// شريط أعلى الشاشة يظهر تلقائياً عند فقد الاتصال

import { useEffect, useRef, useState, type FC } from 'react';
import { useOnline } from '../hooks/useOnline';
import { colors, fontFamily } from '../theme/tokens';

export const OfflineBanner: FC = () => {
  const online = useOnline();
  const [show, setShow] = useState(false);
  // إظهار رسالة "عاد الاتصال" لـ 2 ثانية ثم إخفاء
  const [reconnected, setReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!online) {
      setShow(true);
      setReconnected(false);
      wasOfflineRef.current = true;
    } else if (wasOfflineRef.current) {
      setReconnected(true);
      const t = window.setTimeout(() => {
        setShow(false);
        setReconnected(false);
        wasOfflineRef.current = false;
      }, 2000);
      return () => window.clearTimeout(t);
    }
  }, [online]);

  if (!show) return null;

  const bg   = reconnected ? colors.success : '#FF7043';
  const icon = reconnected ? '🟢' : '📡';
  const text = reconnected
    ? 'عاد الاتصال — كل شيء يعمل'
    : 'لا يوجد اتصال — بعض الميزات معطّلة، يمكنك استعمال أرقام الطوارئ والتهدئة';

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 99999,
        background: bg,
        color: colors.white,
        padding: '8px 12px',
        fontFamily,
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        direction: 'rtl',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        animation: 'slide-up 0.25s ease',
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
};
