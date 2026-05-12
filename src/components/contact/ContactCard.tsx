// بطاقة جهة اتصال للطوارئ — تفتح dialer + toast تأكيد

import type { FC } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { useToast } from '../../hooks/useToast';
import { colors, fontFamily } from '../../theme/tokens';

export interface EmergencyContact {
  name: string;
  number: string;
  icon: IconName;
  color: string;
  desc: string;
}

interface Props { contact: EmergencyContact; }

export const ContactCard: FC<Props> = ({ contact }) => {
  const toast = useToast();

  const dial = () => {
    toast.info(`جاري الاتصال بـ ${contact.name}...`);
    // tel: يفتح dialer النظام على Android والمتصفّح
    window.location.href = `tel:${contact.number}`;
  };

  return (
    <button
      onClick={dial}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 14px', borderRadius: 16, border: 'none',
        background: colors.bgCard,
        boxShadow: `0 2px 8px ${colors.cardShadow}`,
        cursor: 'pointer', transition: 'all 0.2s',
        width: '100%',
        fontFamily,
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: `${contact.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={contact.icon} size={23} color={contact.color} />
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{contact.name}</div>
        <div style={{ fontSize: 11, color: colors.textMuted }}>{contact.desc}</div>
      </div>
      <div style={{
        padding: '8px 13px', borderRadius: 50,
        background: contact.color, fontSize: 12, fontWeight: 700,
        color: colors.white, boxShadow: `0 3px 10px ${contact.color}55`,
      }}>اتصال</div>
    </button>
  );
};
