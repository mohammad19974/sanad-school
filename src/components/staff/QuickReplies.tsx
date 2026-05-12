// شريط ردود سريعة قابل للتمرير الأفقي — RTL aware

import type { FC } from 'react';
import { colors, fontFamily } from '../../theme/tokens';
import { STAFF_QUICK_REPLIES, STUDENT_QUICK_REPLIES } from '../../types';

interface Props {
  role: 'student' | 'staff';
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export const QuickReplies: FC<Props> = ({ role, onSelect, disabled }) => {
  const replies = role === 'staff' ? STAFF_QUICK_REPLIES : STUDENT_QUICK_REPLIES;
  return (
    <div
      // RTL: المحتوى يبدأ من اليمين ويُمرَّر يساراً
      className="sanad-quick-replies"
      style={{
        display: 'flex', gap: 6,
        padding: '6px 12px 10px',
        overflowX: 'auto', overflowY: 'hidden',
        flexWrap: 'nowrap',
        direction: 'rtl', fontFamily,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      onWheel={(e) => {
        // تمرير عمودي → أفقي (للماوس)
        const el = e.currentTarget;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          el.scrollLeft += e.deltaY;
        }
      }}
    >
      {replies.map((r, i) => (
        <button
          key={i}
          onClick={() => onSelect(r.text)}
          disabled={disabled}
          style={{
            flexShrink: 0, padding: '9px 14px', borderRadius: 50,
            background: colors.bgCard, border: `1.5px solid ${colors.bgDark}`,
            color: colors.text, fontSize: 12, fontWeight: 600, fontFamily,
            cursor: disabled ? 'default' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            opacity: disabled ? 0.5 : 1,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 14 }}>{r.emoji}</span>
          <span>{r.text}</span>
        </button>
      ))}
    </div>
  );
};
