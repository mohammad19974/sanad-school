// مفتاح تشغيل/إيقاف بسيط

import type { FC } from 'react';
import { colors } from '../theme/tokens';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle: FC<Props> = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    role="switch"
    aria-checked={value}
    style={{
      width: 46,
      height: 26,
      borderRadius: 13,
      background: value ? colors.primary : '#ccc',
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
      cursor: 'pointer',
      transition: 'background 0.2s',
    }}
  >
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: colors.white,
        // مع RTL: عند التشغيل ينزلق الزر إلى اليسار (mirror image of LTR)
        marginRight: value ? 18 : 0,
        transition: 'margin 0.2s',
      }}
    />
  </div>
);
