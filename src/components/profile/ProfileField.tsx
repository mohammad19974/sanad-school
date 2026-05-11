// حقل إدخال نصّي مع أيقونة — يستخدم في صفحة الملف الشخصي

import type { FC } from 'react';
import { Icon, type IconName } from '../../ui/Icon';
import { colors, fontFamily } from '../../theme/tokens';

interface Props {
  label: string;
  icon: IconName;
  value: string;
  placeholder: string;
  editing: boolean;
  type?: string;
  onChange: (value: string) => void;
}

export const ProfileField: FC<Props> = ({
  label, icon, value, placeholder, editing, type = 'text', onChange,
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 14px',
    borderBottom: `1px solid ${colors.bgDark}`,
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: `${colors.primary}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={17} color={colors.primary} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: colors.textMuted, fontFamily, marginBottom: 2 }}>{label}</div>
      {editing ? (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: 13, fontFamily,
            background: 'transparent',
            color: colors.text, fontWeight: 600, textAlign: 'right',
          }}
        />
      ) : (
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: value ? colors.text : colors.textLight,
          fontFamily,
        }}>{value || placeholder}</div>
      )}
    </div>
  </div>
);
