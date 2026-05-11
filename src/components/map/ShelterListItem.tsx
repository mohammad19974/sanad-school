// عنصر قائمة لملجأ واحد — قابل للنقر لتحديد الملجأ على الخريطة

import type { FC } from 'react';
import { Icon } from '../../ui/Icon';
import { colors, fontFamily } from '../../theme/tokens';
import { formatDistance } from '../../helpers/distance';
import {
  shelterTypeLabel, shelterTypeIcon, type Shelter,
} from '../../types';

interface Props {
  shelter: Shelter;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const ShelterListItem: FC<Props> = ({ shelter, selected, onSelect }) => (
  <button
    onClick={() => onSelect(shelter.id)}
    style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
      borderRadius: 16,
      border: `2px solid ${selected ? colors.primary : 'transparent'}`,
      background: selected ? `${colors.primary}12` : colors.bgCard,
      boxShadow: `0 2px 8px ${colors.cardShadow}`,
      cursor: 'pointer', transition: 'all 0.2s',
      width: '100%',
      fontFamily,
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 14,
      background: `${colors.primary}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={shelterTypeIcon[shelter.type] as 'shield' | 'ambulance'} size={22} color={colors.primary} />
    </div>
    <div style={{ flex: 1, textAlign: 'right' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{shelter.name}</div>
      <div style={{ fontSize: 11, color: colors.textMuted }}>
        {shelterTypeLabel[shelter.type]} · {formatDistance(shelter.distanceMeters)} منك
      </div>
    </div>
    <div style={{
      fontSize: 11, fontWeight: 700, color: colors.white,
      background: colors.primary, padding: '4px 10px', borderRadius: 20,
    }}>
      {formatDistance(shelter.distanceMeters)}
    </div>
  </button>
);
