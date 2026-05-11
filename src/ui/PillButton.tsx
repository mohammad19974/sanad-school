// زر دائري بحدود مدوّرة كاملة (شكل حبة الدواء)

import type { CSSProperties, FC, ReactNode } from 'react';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme/tokens';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'white';
  disabled?: boolean;
  style?: CSSProperties;
}

export const PillButton: FC<Props> = ({
  children, onClick, variant = 'primary', disabled = false, style,
}) => {
  const base: CSSProperties = {
    padding: '12px 28px',
    borderRadius: radius.pill,
    border: 'none',
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled ? 0.6 : 1,
  };

  const variants: Record<string, CSSProperties> = {
    primary: { background: colors.primary, color: colors.white, boxShadow: `0 4px 16px ${colors.pulse}` },
    outline: { background: 'transparent', color: colors.primary, border: `1.5px solid ${colors.primary}` },
    white:   { background: colors.white, color: colors.primaryDark, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
  };

  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};
