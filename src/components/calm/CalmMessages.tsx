// 5 رسائل تشجيعية للأطفال أثناء التوتّر

import type { FC } from 'react';
import { colors, fontFamily } from '../../theme/tokens';

const MESSAGES: string[] = [
  '💛 أنت شجاع وقوي، وهذه اللحظة ستمر.',
  '🌿 كل نفس تأخذه يقربك من الأمان.',
  '🤝 هناك من يحبك وينتظرك بأمان.',
  '⭐ أنت لست وحدك، سند معك دائماً.',
  '🌊 مثل الموج، هذا الخوف سيمر ويهدأ.',
];

export const CalmMessages: FC = () => (
  <div style={{
    flex: 1, padding: '0 16px',
    display: 'flex', flexDirection: 'column', gap: 9,
    overflowY: 'auto',
  }}>
    {MESSAGES.map((m, i) => (
      <div key={i} style={{
        padding: '13px 15px', borderRadius: 16,
        background: 'rgba(255,255,255,0.16)',
      }}>
        <span style={{
          fontSize: 14, color: colors.white, fontFamily, lineHeight: 1.6,
        }}>{m}</span>
      </div>
    ))}
  </div>
);
