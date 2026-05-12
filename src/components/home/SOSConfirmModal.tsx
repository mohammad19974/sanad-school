// مودال تأكيد إرسال SOS — عدّ تنازلي 3 ثوانٍ مع إلغاء
// يمنع الضغطات العفوية ويُعطي المستخدم فرصة للتراجع

import { useEffect, useRef, useState, type FC } from 'react';
import { IonModal } from '@ionic/react';
import { Icon } from '../../ui/Icon';
import { PillButton } from '../../ui/PillButton';
import { useHaptics } from '../../hooks/useHaptics';
import { colors, fontFamily } from '../../theme/tokens';

const COUNTDOWN_SEC = 3;

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SOSConfirmModal: FC<Props> = ({ isOpen, onCancel, onConfirm }) => {
  const [remaining, setRemaining] = useState(COUNTDOWN_SEC);
  const tickRef     = useRef<number | null>(null);
  const haptics     = useHaptics();
  const firedRef    = useRef(false);

  // ─── إدارة العدّاد ─────────────────────────
  useEffect(() => {
    if (!isOpen) {
      // إعادة التهيئة عند الإغلاق
      if (tickRef.current != null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setRemaining(COUNTDOWN_SEC);
      firedRef.current = false;
      return;
    }

    setRemaining(COUNTDOWN_SEC);
    firedRef.current = false;
    haptics.impact('heavy');

    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (tickRef.current != null) {
            window.clearInterval(tickRef.current);
            tickRef.current = null;
          }
          // أرسل تلقائياً عند الوصول للصفر — مرّة واحدة
          if (!firedRef.current) {
            firedRef.current = true;
            window.setTimeout(() => onConfirm(), 0);
          }
          return 0;
        }
        haptics.impact('medium');
        return r - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current != null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cancel = () => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    onCancel();
  };

  const sendNow = () => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (!firedRef.current) {
      firedRef.current = true;
      onConfirm();
    }
  };

  // نسبة التقدّم للحلقة (1 = البداية، 0 = نهاية)
  const progress = remaining / COUNTDOWN_SEC;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={cancel}
      backdropDismiss={false}
      style={{ '--background': 'transparent' }}
    >
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: `linear-gradient(160deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
        fontFamily, direction: 'rtl',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, gap: 24,
      }}>
        <div style={{
          fontSize: 22, fontWeight: 800, color: colors.white,
          textAlign: 'center',
        }}>
          {remaining > 0 ? 'سيتم إرسال طلب النجدة' : 'جاري الإرسال...'}
        </div>
        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center',
          maxWidth: 280, lineHeight: 1.6,
        }}>
          {remaining > 0
            ? 'سيتم إعلام ولي الأمر والمنسّق المدرسي مع موقعك الحالي'
            : 'الرجاء الانتظار'}
        </div>

        {/* العدّاد الكبير مع حلقة تقدّم */}
        <div style={{ position: 'relative', width: 200, height: 200 }}>
          <svg width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={100} cy={100} r={90}
              stroke="rgba(255,255,255,0.15)" strokeWidth={6} fill="none" />
            <circle cx={100} cy={100} r={90}
              stroke={colors.white} strokeWidth={6} fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={(2 * Math.PI * 90) * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4,
          }}>
            {remaining > 0 ? (
              <>
                <div style={{
                  fontSize: 84, fontWeight: 800, color: colors.white,
                  lineHeight: 1, fontFamily,
                }}>{remaining}</div>
                <div style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily,
                }}>ثانية</div>
              </>
            ) : (
              <Icon name="check" size={70} color={colors.white} />
            )}
          </div>
        </div>

        {/* الأزرار */}
        {remaining > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            width: '100%', maxWidth: 320,
          }}>
            <PillButton onClick={sendNow} variant="white">
              إرسال الآن
            </PillButton>
            <button
              onClick={cancel}
              style={{
                padding: '13px', borderRadius: 50, fontFamily,
                background: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.6)',
                color: colors.white, fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </IonModal>
  );
};
