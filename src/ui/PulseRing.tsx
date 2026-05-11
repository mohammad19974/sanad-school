// تأثير 3 حلقات نابضة حول زر النجدة

import type { FC } from 'react';
import { colors } from '../theme/tokens';

interface Props {
  /** قطر الحلقة الداخلية بالبكسل */
  baseSize?: number;
  /** عدد الحلقات (افتراضي 3) */
  rings?: number;
}

export const PulseRing: FC<Props> = ({ baseSize = 140, rings = 3 }) => (
  <>
    {Array.from({ length: rings }, (_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: baseSize + (i + 1) * 36,
          height: baseSize + (i + 1) * 36,
          borderRadius: '50%',
          background: colors.pulse,
          animation: `pulse-ring 2.2s ease-out ${(i + 1) * 0.55}s infinite`,
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);
