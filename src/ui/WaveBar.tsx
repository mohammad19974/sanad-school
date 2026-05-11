// شريط من 8 موجات تتحرك كموجات صوتية

import type { FC } from 'react';

export const WaveBar: FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 56 }}>
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="wave-bar" />
    ))}
  </div>
);
