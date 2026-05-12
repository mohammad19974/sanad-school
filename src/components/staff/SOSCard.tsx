// بطاقة طلب SOS في لوحة المنسّق

import type { FC } from 'react';
import { Icon } from '../../ui/Icon';
import { StatusBadge } from './StatusBadge';
import { colors, fontFamily } from '../../theme/tokens';
import type { SOSRequest } from '../../types';

interface Props {
  request: SOSRequest;
  onClick: () => void;
  isUnread?: boolean;
}

export const SOSCard: FC<Props> = ({ request, onClick, isUnread }) => {
  const s = request.studentSnapshot;
  const urgent = request.status === 'pending';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'stretch', gap: 12,
        padding: '14px 14px', borderRadius: 16, border: 'none',
        background: urgent ? `${colors.danger}10` : colors.bgCard,
        boxShadow: `0 2px 10px ${colors.cardShadow}`,
        cursor: 'pointer', width: '100%', textAlign: 'right',
        fontFamily,
        borderRight: urgent ? `4px solid ${colors.danger}` : `4px solid transparent`,
        animation: urgent && isUnread ? 'breathe 1.5s ease-in-out infinite' : 'none',
        transition: 'all 0.2s',
      }}
    >
      {/* صورة/أيقونة */}
      <div style={{
        width: 50, height: 50, borderRadius: 14,
        background: urgent ? `${colors.danger}25` : `${colors.primary}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={urgent ? 'sos' : 'user'} size={26}
          color={urgent ? colors.danger : colors.primary} />
      </div>

      {/* النصّ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: colors.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{s.name || 'طالب'}</div>
          <span style={{ fontSize: 10, color: colors.textMuted, flexShrink: 0 }}>
            {relativeTime(request.createdAt)}
          </span>
        </div>

        <div style={{
          fontSize: 11, color: colors.textMuted,
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          {s.blood && <Chip label={s.blood} color={colors.danger} />}
          {s.disability && <Chip label={s.disability} color={colors.primary} />}
        </div>

        <div style={{
          fontSize: 10, color: colors.textLight,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>📍 {request.location.lat.toFixed(4)}, {request.location.lng.toFixed(4)}</span>
          {request.location.accuracy != null && (
            <span>(±{Math.round(request.location.accuracy)}م)</span>
          )}
        </div>

        <div style={{ marginTop: 4 }}>
          <StatusBadge status={request.status} size="sm" />
          {request.acknowledgedByName && (
            <span style={{ fontSize: 10, color: colors.textMuted, marginRight: 8 }}>
              · بواسطة {request.acknowledgedByName}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const Chip: FC<{ label: string; color: string }> = ({ label, color }) => (
  <span style={{
    padding: '2px 6px', borderRadius: 6,
    background: `${color}15`, color, fontSize: 9, fontWeight: 700,
  }}>{label}</span>
);

const relativeTime = (ms: number): string => {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / (1000 * 60));
  if (min < 1) return 'الآن';
  if (min < 60) return `${min} د`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} س`;
  return `${Math.floor(hr / 24)} يوم`;
};
