// بطاقة محادثة واحدة في قائمة المحادثات — تشبه WhatsApp/Telegram

import type { FC } from 'react';
import { StatusBadge } from './StatusBadge';
import { colors, fontFamily } from '../../theme/tokens';
import type { ChatThread } from '../../hooks/useChatThreads';

interface Props {
  thread: ChatThread;
  onClick: () => void;
}

export const ChatThreadCard: FC<Props> = ({ thread, onClick }) => {
  const s = thread.request.studentSnapshot;
  const last = thread.lastMessage;
  const initial = (s.name?.[0] ?? '؟').toUpperCase();
  const isUrgent = thread.request.status === 'pending';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', gap: 12, padding: '14px 14px',
        borderRadius: 16, border: 'none',
        background: thread.hasUnread ? `${colors.primary}10` : colors.bgCard,
        boxShadow: `0 2px 8px ${colors.cardShadow}`,
        cursor: 'pointer', width: '100%', textAlign: 'right',
        fontFamily,
        transition: 'all 0.2s',
      }}
    >
      {/* Avatar مع نقطة حالة */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: isUrgent
            ? `linear-gradient(135deg, ${colors.danger}, #FF7043)`
            : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.white, fontSize: 22, fontWeight: 800,
        }}>{initial}</div>
        {isUrgent && (
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: colors.danger,
            border: `2.5px solid ${thread.hasUnread ? `${colors.primary}10` : colors.bgCard}`,
            animation: 'breathe 1.5s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* المحتوى */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: colors.text, flex: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{s.name || 'طالب'}</div>
          <div style={{ fontSize: 10, color: colors.textMuted, flexShrink: 0 }}>
            {formatRelative(thread.lastActivityAt)}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, minWidth: 0,
        }}>
          <div style={{
            flex: 1, fontSize: 12,
            color: thread.hasUnread ? colors.text : colors.textMuted,
            fontWeight: thread.hasUnread ? 600 : 400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {last ? formatPreview(last.text, last.senderRole === 'staff') : 'لم تبدأ المحادثة بعد'}
          </div>
          {thread.hasUnread && (
            <div style={{
              minWidth: 20, height: 20, padding: '0 7px',
              borderRadius: 10, background: colors.primary,
              color: colors.white, fontSize: 10, fontWeight: 800,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>جديد</div>
          )}
        </div>

        <div>
          <StatusBadge status={thread.request.status} size="sm" />
        </div>
      </div>
    </button>
  );
};

/** "أنت: ..." لرسائلك، أو نصّ الرسالة فقط */
const formatPreview = (text: string, isMine: boolean): string => {
  const preview = text.length > 50 ? `${text.slice(0, 50)}...` : text;
  return isMine ? `أنت: ${preview}` : preview;
};

const formatRelative = (ms: number): string => {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'الآن';
  if (min < 60) return `${min} د`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} س`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} يوم`;
  return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short' }).format(ms);
};
