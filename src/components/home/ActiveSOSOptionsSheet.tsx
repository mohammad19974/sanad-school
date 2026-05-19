// شيت يظهر عند ضغط زر النجدة عند وجود طلب نشط
// يعطي الطالب خيارات: فتح المحادثة / التهدئة / إلغاء الطلب

import type { FC } from 'react';
import { IonModal } from '@ionic/react';
import { StatusBadge } from '../staff/StatusBadge';
import { colors, fontFamily } from '../../theme/tokens';
import type { SOSRequest } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: SOSRequest;
  onOpenChat: () => void;
  onOpenCalm: () => void;
  onCancelSOS: () => void;
}

export const ActiveSOSOptionsSheet: FC<Props> = ({
  isOpen, onClose, request, onOpenChat, onOpenCalm, onCancelSOS,
}) => (
  <IonModal
    isOpen={isOpen}
    onDidDismiss={onClose}
    initialBreakpoint={0.62}
    breakpoints={[0, 0.62, 0.92]}
    handle={true}
    style={{ '--background': colors.bg }}
  >
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: colors.bg, fontFamily, direction: 'rtl',
      padding: '8px 20px 28px', gap: 16,
    }}>
      {/* رأس */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ fontSize: 32 }}>🆘</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginTop: 4 }}>
          لديك طلب نجدة نشط
        </div>
        <div style={{ marginTop: 8 }}>
          <StatusBadge status={request.status} />
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 10, lineHeight: 1.6 }}>
          ما الذي تحتاجه الآن؟
        </div>
      </div>

      {/* الخيارات */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <OptionBtn
          emoji="💬"
          title="افتح المحادثة"
          desc="تواصل مع المنقذ الآن"
          accent={colors.primary}
          onClick={onOpenChat}
        />
        <OptionBtn
          emoji="🧘"
          title="مركز التهدئة"
          desc="تنفّس • أصوات • ألعاب مهدّئة"
          accent="#7B6FAD"
          onClick={onOpenCalm}
        />
        <OptionBtn
          emoji="✅"
          title="أنا بخير الآن"
          desc="إلغاء طلب النجدة"
          accent={colors.success}
          onClick={onCancelSOS}
        />
      </div>

      <button
        onClick={onClose}
        style={{
          padding: '12px', borderRadius: 14,
          background: 'transparent', border: `1.5px solid ${colors.bgDark}`,
          color: colors.textMuted, fontFamily, fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
        }}
      >إغلاق</button>
    </div>
  </IonModal>
);

// ─── زرّ خيار بتصميم بطاقة ─────────────────────────

interface OptionBtnProps {
  emoji: string;
  title: string;
  desc:  string;
  accent: string;
  onClick: () => void;
}
const OptionBtn: FC<OptionBtnProps> = ({ emoji, title, desc, accent, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 16px',
      borderRadius: 16,
      background: `${accent}10`,
      border: `1.5px solid ${accent}40`,
      cursor: 'pointer',
      width: '100%', textAlign: 'right',
      fontFamily,
      transition: 'all 0.15s',
    }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: 16,
      background: accent, color: colors.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 26, flexShrink: 0,
      boxShadow: `0 4px 12px ${accent}55`,
    }}>{emoji}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: colors.text }}>{title}</div>
      <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{desc}</div>
    </div>
    <span style={{ color: accent, fontSize: 22, fontWeight: 700 }}>‹</span>
  </button>
);
