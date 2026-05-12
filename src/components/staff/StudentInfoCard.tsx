// بطاقة معلومات الطالب — تُعرض في صفحة تفاصيل SOS للمنسّق

import type { FC } from 'react';
import { Icon } from '../../ui/Icon';
import { colors, fontFamily } from '../../theme/tokens';
import type { StudentSnapshot } from '../../types';

interface Props { student: StudentSnapshot; }

export const StudentInfoCard: FC<Props> = ({ student }) => (
  <div style={{
    background: colors.bgCard, borderRadius: 18,
    padding: 16, boxShadow: `0 2px 10px ${colors.cardShadow}`,
    fontFamily,
  }}>
    {/* رأس */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 54, height: 54, borderRadius: 18,
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="user" size={28} color={colors.white} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
          {student.name || 'طالب'}
        </div>
        {student.phone && (
          <div style={{ fontSize: 12, color: colors.textMuted }}>{student.phone}</div>
        )}
      </div>
      {student.blood && (
        <div style={{
          padding: '8px 14px', borderRadius: 14,
          background: `${colors.danger}18`,
          color: colors.danger, fontSize: 18, fontWeight: 800,
          border: `1.5px solid ${colors.danger}40`,
        }}>{student.blood}</div>
      )}
    </div>

    {/* جدول معلومات طبية */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {student.disability && (
        <Row icon="brain" label="نوع الإعاقة" value={student.disability} />
      )}
      {student.meds && (
        <Row icon="brain" label="الأدوية الدائمة" value={student.meds} accent={colors.accent} />
      )}
      {student.allergies && (
        <Row icon="bell" label="الحساسية" value={student.allergies} accent={colors.danger} />
      )}
      {student.guardianName && (
        <Row icon="family" label="ولي الأمر"
          value={`${student.guardianName}${student.guardianPhone ? ' · ' + student.guardianPhone : ''}`}
          link={student.guardianPhone ? `tel:${student.guardianPhone}` : undefined}
        />
      )}
    </div>
  </div>
);

interface RowProps {
  icon: import('../../ui/Icon').IconName;
  label: string;
  value: string;
  accent?: string;
  link?: string;
}
const Row: FC<RowProps> = ({ icon, label, value, accent, link }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 12,
    background: accent ? `${accent}10` : colors.bg,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: `${accent || colors.primary}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={16} color={accent || colors.primary} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: colors.textMuted }}>{label}</div>
      {link ? (
        <a href={link} style={{
          fontSize: 13, fontWeight: 600, color: accent || colors.primary,
          textDecoration: 'none',
        }}>{value}</a>
      ) : (
        <div style={{
          fontSize: 13, fontWeight: 600, color: colors.text,
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{value}</div>
      )}
    </div>
  </div>
);
