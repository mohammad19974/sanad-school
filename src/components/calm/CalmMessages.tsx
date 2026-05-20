// 5 رسائل تشجيعية للأطفال أثناء التوتّر

import type { FC } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { colors, fontFamily } from '../../theme/tokens';

const MESSAGES_AR: string[] = [
  '💛 أنت شجاع وقوي، وهذه اللحظة ستمر.',
  '🌿 كل نفس تأخذه يقربك من الأمان.',
  '🤝 هناك من يحبك وينتظرك بأمان.',
  '⭐ أنت لست وحدك، نبض معك دائماً.',
  '🌊 مثل الموج، هذا الخوف سيمر ويهدأ.',
];

const MESSAGES_HE: string[] = [
  '💛 אתה אמיץ וחזק, והרגע הזה יחלוף.',
  '🌿 כל נשימה שאתה לוקח מקרבת אותך לבטחון.',
  '🤝 יש מי שאוהב אותך ומחכה לך בשלום.',
  '⭐ אתה לא לבד, נבד תמיד איתך.',
  '🌊 כמו הגל, גם הפחד הזה יחלוף וירגע.',
];

export const CalmMessages: FC = () => {
  const { lang } = useLanguage();
  const MESSAGES = lang === 'he' ? MESSAGES_HE : MESSAGES_AR;
  return (
  <div style={{
    flex: 1, padding: '0 16px',
    display: 'flex', flexDirection: 'column', gap: 9,
    overflowY: 'auto',
  }}>
    {MESSAGES.map((m, i) => (
      <div key={i} style={{
        padding: '16px 18px', borderRadius: 16,
        background: 'rgba(255,255,255,0.16)',
      }}>
        <span style={{
          fontSize: 17, color: colors.white, fontFamily, lineHeight: 1.7, fontWeight: 600,
        }}>{m}</span>
      </div>
    ))}
  </div>
  );
};
