// شريط حالة أعلى الشاشة — إمّا "أنت آمن" أو "تم إرسال طلب النجدة"

import type { FC } from 'react';
import { Icon } from '../../ui/Icon';
import { useLanguage } from '../../context/LanguageContext';
import { colors, fontFamily } from '../../theme/tokens';

interface Props {
  sosSent: boolean;
}

export const StatusBanner: FC<Props> = ({ sosSent }) => {
  const { lang } = useLanguage();
  const sentText  = lang === 'he' ? '✅ בקשת העזרה נשלחה!' : '✅ تم إرسال طلب المساعدة!';
  const safeText  = lang === 'he' ? '📍 מיקומך זוהה — אתה באזור בטוח יחסית' : '📍 موقعك محدد — أنت في منطقة آمنة نسبياً';
  return (
  <div
    style={{
      margin: '6px 16px',
      padding: '11px 14px',
      borderRadius: 14,
      background: sosSent ? colors.success : `${colors.primaryLight}22`,
      border: `1.5px solid ${sosSent ? colors.success : colors.primaryLight}`,
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      transition: 'all 0.4s',
    }}
  >
    <Icon name={sosSent ? 'check' : 'location'} size={19} color={sosSent ? colors.white : colors.primary} />
    <span style={{
      fontSize: 13, fontFamily,
      color: sosSent ? colors.white : colors.primary,
      fontWeight: 600,
    }}>
      {sosSent ? sentText : safeText}
    </span>
  </div>
  );
};
