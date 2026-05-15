// شارة بصرية تُظهر حالة الاستماع الصوتي
// listening: نقطة حمراء نابضة + "أقول نجدة"

import type { FC } from 'react';
import { Icon } from '../../ui/Icon';
import type { VoiceStatus } from '../../hooks/useVoiceTrigger';
import { colors, fontFamily } from '../../theme/tokens';

interface Props {
  status: VoiceStatus;
}

const labelFor = (s: VoiceStatus): { text: string; color: string; icon: 'mic' | null } => {
  switch (s) {
    case 'listening':   return { text: 'قُل "نجدة" لطلب المساعدة',  color: colors.danger,  icon: 'mic' };
    case 'denied':      return { text: 'إذن المايكروفون مرفوض — فعّله من المتصفّح', color: colors.warning, icon: 'mic' };
    case 'unsupported': return { text: 'متصفّحك لا يدعم التفعيل الصوتي',         color: colors.textMuted, icon: null };
    case 'error':       return { text: 'تعذّر بدء الاستماع — حاول لاحقاً',       color: colors.warning, icon: null };
    case 'idle':
    default:            return { text: '',                                       color: colors.textMuted, icon: null };
  }
};

export const VoiceTriggerIndicator: FC<Props> = ({ status }) => {
  const meta = labelFor(status);
  if (!meta.text) return null;

  const isListening = status === 'listening';

  return (
    <div style={{
      margin: '6px 16px',
      padding: '8px 12px',
      borderRadius: 12,
      background: isListening ? `${colors.danger}10` : `${meta.color}10`,
      border: `1.5px solid ${isListening ? colors.danger : meta.color}40`,
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily, fontSize: 12, fontWeight: 600, color: meta.color,
      direction: 'rtl',
    }}>
      {meta.icon === 'mic' && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="mic" size={16} color={meta.color} />
          {isListening && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8, borderRadius: '50%',
              background: colors.danger,
              animation: 'breathe 1s ease-in-out infinite',
            }} />
          )}
        </div>
      )}
      <span>{meta.text}</span>
    </div>
  );
};
