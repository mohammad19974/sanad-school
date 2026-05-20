// 3 أزرار سريعة أسفل زر SOS

import type { FC } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();
  const actions: Action[] = [
    { icon: 'ambulance', label: t('home.quick.ambulance'), color: colors.danger,  onClick: onAmbulance },
    { icon: 'map',       label: t('home.quick.shelter'),   color: colors.primary, onClick: onShelter },
    { icon: 'calm',      label: t('home.quick.calm'),      color: '#7B6FAD',      onClick: onCalm },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 18px', width: '100%' }}>
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          style={{
            flex: 1, padding: '14px 6px', borderRadius: 16,
            background: colors.bgCard, border: `1.5px solid ${colors.bgDark}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            cursor: 'pointer', boxShadow: `0 2px 8px ${colors.cardShadow}`,
            fontFamily,
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: `${a.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={a.icon} size={26} color={a.color} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily }}>
            {a.label}
          </span>
        </button>
      ))}
    </div>
  );
};
