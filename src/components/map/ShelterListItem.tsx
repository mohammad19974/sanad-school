// عنصر قائمة لملجأ واحد — قابل للنقر لتحديد الملجأ على الخريطة
// كل فئة لها لون مميّز (مدرسة/مستشفى/شرطة/دفاع مدني/ملجأ)

import type { FC } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { colors, fontFamily } from '../../theme/tokens';
import { formatDistance } from '../../helpers/distance';
import {
  shelterTypeLabel, shelterTypeIcon, shelterTypeColor,
  type Shelter,
} from '../../types';

interface Props {
  shelter: Shelter;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const ShelterListItem: FC<Props> = ({ shelter, selected, onSelect }) => {
  const accent = shelterTypeColor[shelter.type];
  return (
    <button
      onClick={() => onSelect(shelter.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
        borderRadius: 16,
        border: `2px solid ${selected ? accent : 'transparent'}`,
        background: selected ? `${accent}12` : colors.bgCard,
        boxShadow: `0 2px 8px ${colors.cardShadow}`,
        cursor: 'pointer', transition: 'all 0.2s',
        width: '100%',
        fontFamily,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `${accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={shelterTypeIcon[shelter.type] as IconName} size={22} color={accent} />
      </div>
      <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: colors.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{shelter.name}</div>
        <div style={{ fontSize: 11, color: colors.textMuted }}>
          {shelterTypeLabel[shelter.type]} · {formatDistance(shelter.distanceMeters)} منك
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: colors.white,
        background: accent, padding: '4px 10px', borderRadius: 20,
        flexShrink: 0,
      }}>
        {formatDistance(shelter.distanceMeters)}
      </div>
    </button>
  );
};
