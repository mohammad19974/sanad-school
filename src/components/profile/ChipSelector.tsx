// محدّد قيمة من قائمة محدودة (chips) — مثل: الصف، فصيلة الدم

import { colors, fontFamily } from '../../theme/tokens';

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T | '';
  onChange: (value: T) => void;
  editing: boolean;
  variant?: 'pill' | 'square';
  activeColor?: string;
}

export const ChipSelector = <T extends string>({
  label, options, value, onChange, editing, variant = 'pill', activeColor,
}: Props<T>) => {
  const ac = activeColor ?? colors.primary;

  return (
    <div style={{ padding: '11px 14px', borderBottom: `1px solid ${colors.bgDark}` }}>
      <div style={{ fontSize: 10, color: colors.textMuted, fontFamily, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: variant === 'square' ? 5 : 6, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const active = value === opt;
          const isSquare = variant === 'square';
          return (
            <button
              key={opt}
              onClick={() => editing && onChange(opt)}
              style={{
                ...(isSquare
                  ? { width: 40, height: 32, borderRadius: 10 }
                  : { padding: '5px 12px', borderRadius: 20 }),
                background: active ? ac : colors.bgDark,
                color: active ? colors.white : colors.textMuted,
                border: 'none',
                fontSize: isSquare ? 12 : 11,
                fontWeight: isSquare ? 700 : 600,
                fontFamily,
                cursor: editing ? 'pointer' : 'default',
              }}
            >{opt}</button>
          );
        })}
      </div>
    </div>
  );
};
