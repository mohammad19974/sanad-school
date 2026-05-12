// شارة حالة طلب SOS — لون + نص

import type { FC } from 'react';
import { statusLabel, statusColor, type SOSStatus } from '../../types';
import { fontFamily } from '../../theme/tokens';

interface Props {
  status: SOSStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: FC<Props> = ({ status, size = 'md' }) => {
  const color = statusColor[status];
  const isSm  = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: isSm ? '3px 8px' : '5px 12px',
      borderRadius: 50,
      background: `${color}18`,
      color,
      fontSize: isSm ? 10 : 11,
      fontWeight: 700,
      fontFamily,
      border: `1px solid ${color}40`,
    }}>
      <span style={{
        width: isSm ? 6 : 7, height: isSm ? 6 : 7,
        borderRadius: '50%', background: color,
        animation: status === 'pending' ? 'breathe 1.2s ease-in-out infinite' : 'none',
      }} />
      {statusLabel[status]}
    </span>
  );
};
