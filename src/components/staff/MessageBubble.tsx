// فقاعة رسالة chat واحدة — مع إيصالات قراءة ✓ / ✓✓

import type { FC } from 'react';
import { colors, fontFamily } from '../../theme/tokens';
import type { ChatMessage, UserRole } from '../../types';

interface Props {
  message: ChatMessage;
  isMine:  boolean;
  /** هل قُرئت من الطرف الآخر (يُحسب في ChatPanel) */
  isRead?: boolean;
}

export const MessageBubble: FC<Props> = ({ message, isMine, isRead = false }) => {
  const isSystem = message.kind === 'system';

  if (isSystem) {
    return (
      <div style={{
        alignSelf: 'center', padding: '6px 14px',
        background: 'rgba(0,0,0,0.06)', borderRadius: 12,
        fontSize: 11, color: colors.textMuted, fontFamily,
      }}>
        {message.text}
      </div>
    );
  }

  const bgColor   = isMine ? colors.primary : colors.bgCard;
  const textColor = isMine ? colors.white   : colors.text;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isMine ? 'flex-start' : 'flex-end',
      maxWidth: '78%',
      alignSelf: isMine ? 'flex-start' : 'flex-end',
      fontFamily,
    }}>
      {!isMine && (
        <div style={{
          fontSize: 10, color: colors.textMuted, marginBottom: 3,
          padding: '0 4px',
        }}>
          {message.senderName} <RoleChip role={message.senderRole} />
        </div>
      )}
      <div style={{
        background: bgColor, color: textColor,
        padding: '9px 14px',
        borderRadius: 16,
        borderTopRightRadius: isMine ? 16 : 4,
        borderTopLeftRadius:  isMine ? 4  : 16,
        fontSize: 14, lineHeight: 1.5,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        boxShadow: `0 1px 4px ${colors.cardShadow}`,
      }}>
        {message.text}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginTop: 3, padding: '0 6px',
        fontSize: 10, color: colors.textMuted,
      }}>
        <span>{formatTime(message.createdAt)}</span>
        {isMine && <Ticks read={isRead} />}
      </div>
    </div>
  );
};

/** ✓ مُرسَلة، ✓✓ قُرئت */
const Ticks: FC<{ read: boolean }> = ({ read }) => (
  <span
    aria-label={read ? 'قُرئت' : 'مُرسَلة'}
    style={{
      color: read ? '#2196F3' : colors.textLight,
      fontSize: 12, fontWeight: 700,
      letterSpacing: '-3px',
      display: 'inline-flex', alignItems: 'center',
    }}
  >
    {read ? '✓✓' : '✓'}
  </span>
);

const RoleChip: FC<{ role: UserRole }> = ({ role }) => (
  <span style={{
    padding: '1px 6px', borderRadius: 6,
    background: role === 'staff' ? `${colors.primary}20` : `${colors.accent}20`,
    color:      role === 'staff' ? colors.primary : colors.accent,
    fontSize: 9, fontWeight: 700,
  }}>
    {role === 'staff' ? 'منسّق' : 'طالب'}
  </span>
);

const formatTime = (ms: number): string =>
  new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(ms);
