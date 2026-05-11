// زر النجدة الكبير — يهتزّ ويرسل الموقع عند الضغط

import { useState, type FC } from 'react';
import { Icon } from '../../ui/Icon';
import { PulseRing } from '../../ui/PulseRing';
import { useHaptics } from '../../hooks/useHaptics';
import { colors, fontFamily } from '../../theme/tokens';

interface Props {
  onTrigger: () => Promise<void> | void;
  disabled?: boolean;
}

export const SOSButton: FC<Props> = ({ onTrigger, disabled = false }) => {
  const [pressed, setPressed] = useState(false);
  const haptics = useHaptics();

  const handleClick = async () => {
    if (disabled) return;
    setPressed(true);
    await haptics.impact('heavy');
    try {
      await onTrigger();
      await haptics.success();
    } finally {
      setTimeout(() => setPressed(false), 600);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PulseRing baseSize={140} rings={3} />
      <button
        onClick={handleClick}
        disabled={disabled}
        aria-label="إرسال طلب نجدة"
        style={{
          width: 148, height: 148, borderRadius: '50%',
          background: pressed
            ? colors.primaryDark
            : `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
          border: `4px solid ${colors.primaryLight}`,
          boxShadow: `0 8px 32px ${colors.pulse}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6,
          cursor: disabled ? 'default' : 'pointer',
          transition: 'all 0.15s',
          transform: pressed ? 'scale(0.92)' : 'scale(1)',
          animation: 'breathe 3s ease-in-out infinite',
        }}
      >
        <Icon name="sos" size={40} color={colors.white} />
        <span style={{ fontSize: 16, fontWeight: 800, color: colors.white, fontFamily }}>
          اضغط للنجدة
        </span>
      </button>
    </div>
  );
};
