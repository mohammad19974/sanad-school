// شريط نشط يُعرض عند وجود طلب SOS غير منتهٍ — مع رابط للمحادثة مع المنسّق

import type { FC } from 'react';
import { Icon } from '../../ui/Icon';
import { StatusBadge } from '../staff/StatusBadge';
import { colors, fontFamily } from '../../theme/tokens';
import type { SOSRequest } from '../../types';

interface Props {
  request: SOSRequest;
  onOpenChat: () => void;
}

export const ActiveSOSBanner: FC<Props> = ({ request, onOpenChat }) => (
  <button
    onClick={onOpenChat}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      margin: '6px 16px', padding: '12px 14px', borderRadius: 14,
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
      border: 'none', cursor: 'pointer',
      width: 'calc(100% - 32px)', textAlign: 'right',
      boxShadow: `0 4px 14px ${colors.pulse}`,
      fontFamily,
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: 'rgba(255,255,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      animation: 'breathe 2s ease-in-out infinite',
    }}>
      <Icon name="phone" size={20} color={colors.white} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: colors.white }}>
        طلب نجدة نشط
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
        تواصل مع المنسّق الآن
      </div>
    </div>
    <StatusBadge status={request.status} size="sm" />
    <Icon name="chevL" size={18} color="rgba(255,255,255,0.9)" />
  </button>
);
