// 3 أزرار سريعة أسفل زر SOS

import type { FC } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { colors, fontFamily } from '../../theme/tokens';

interface Action {
  icon: IconName;
  label: string;
  color: string;
  onClick: () => void;
}

interface Props {
  onAmbulance: () => void;
  onShelter: () => void;
  onCalm: () => void;
}

export const QuickActions: FC<Props> = ({ onAmbulance, onShelter, onCalm }) => {
  const actions: Action[] = [
    { icon: 'ambulance', label: 'إسعاف',     color: colors.danger,  onClick: onAmbulance },
    { icon: 'map',       label: 'ملجأ قريب', color: colors.primary, onClick: onShelter },
    { icon: 'calm',      label: 'تهدئة',     color: '#7B6FAD',      onClick: onCalm },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 18px', width: '100%' }}>
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          style={{
            flex: 1, padding: '12px 4px', borderRadius: 16,
            background: colors.bgCard, border: `1.5px solid ${colors.bgDark}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            cursor: 'pointer', boxShadow: `0 2px 8px ${colors.cardShadow}`,
            fontFamily,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${a.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={a.icon} size={22} color={a.color} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.text, fontFamily }}>
            {a.label}
          </span>
        </button>
      ))}
    </div>
  );
};
