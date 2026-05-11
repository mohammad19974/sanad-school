// بطاقة بسيطة بظلّ خفيف وحدود زاوية مدوّرة

import type { CSSProperties, FC, ReactNode } from 'react';
import { colors, radius } from '../theme/tokens';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  padding?: number | string;
}

export const Card: FC<Props> = ({ children, style, onClick, padding = 14 }) => (
  <div
    onClick={onClick}
    style={{
      background: colors.bgCard,
      borderRadius: radius.lg,
      boxShadow: `0 2px 8px ${colors.cardShadow}`,
      padding,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);
