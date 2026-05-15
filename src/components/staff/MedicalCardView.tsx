// عرض البطاقة الطبيّة من MedicalCardData — قابل للاستخدام من:
//   • PublicMedicalCardPage (عام، يُفتح من QR)
//   • QrScannerModal (داخل تطبيق المنسّق بعد المسح)

import type { FC } from 'react';
import { colors, fontFamily } from '../../theme/tokens';
import type { MedicalCardData } from '../../helpers/medicalCardCodec';

interface Props {
  card: MedicalCardData;
  showFooter?: boolean;
}

export const MedicalCardView: FC<Props> = ({ card, showFooter = true }) => (
  <div style={{
    background: colors.white, borderRadius: 24, padding: 24,
    boxShadow: `0 12px 40px ${colors.cardShadow}`,
    display: 'flex', flexDirection: 'column', gap: 14,
    fontFamily, direction: 'rtl',
  }}>
    {/* الاسم */}
    <div style={{ textAlign: 'center', borderBottom: `2px solid ${colors.bgDark}`, paddingBottom: 14 }}>
      <div style={{ fontSize: 11, color: colors.textMuted }}>اسم الطالب</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: colors.text, marginTop: 4 }}>
        {card.n}
      </div>
      {card.i && (
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
          هويّة تنتهي بـ <b style={{ color: colors.text }}>****{card.i}</b>
        </div>
      )}
    </div>

    {/* فصيلة الدم بارزة */}
    {card.b && (
      <BigCard emoji="🩸" label="فصيلة الدم" value={card.b} color={colors.danger} />
    )}

    {/* الحساسية بارزة (حرج) */}
    {card.a && (
      <BigCard
        emoji="⚠️" label="الحساسية — تحذير حيوي" value={card.a}
        color={colors.warning}
      />
    )}

    {/* تفاصيل */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {card.d && <Row emoji="🦮" label="نوع الإعاقة" value={card.d} />}
      {card.m && <Row emoji="💊" label="الأدوية الدائمة" value={card.m} />}
    </div>

    {/* جهات الاتصال */}
    {(card.g || card.s) && (
      <div style={{
        borderTop: `1px solid ${colors.bgDark}`, paddingTop: 12,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted }}>
          📞 الاتصال في حالة الطوارئ
        </div>
        {card.g && <ContactRow contact={card.g} role="ولي الأمر" />}
        {card.s && <ContactRow contact={card.s} role="منسّق المدرسة" />}
      </div>
    )}

    {/* footer */}
    {showFooter && (
      <div style={{
        fontSize: 10, color: colors.textLight, textAlign: 'center',
        paddingTop: 10, borderTop: `1px dashed ${colors.bgDark}`,
      }}>
        صادرة من تطبيق سند • {new Date(card.t).toLocaleString('ar', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </div>
    )}
  </div>
);

// ─── مكوّنات داخليّة ────────────────────────

interface BigCardProps { emoji: string; label: string; value: string; color: string; }
const BigCard: FC<BigCardProps> = ({ emoji, label, value, color }) => (
  <div style={{
    padding: 14, borderRadius: 14,
    background: `${color}15`, border: `2px solid ${color}40`,
    display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{ fontSize: 32 }}>{emoji}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 700 }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 800, color, marginTop: 2,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{value}</div>
    </div>
  </div>
);

interface RowProps { emoji: string; label: string; value: string; }
const Row: FC<RowProps> = ({ emoji, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 10, background: colors.bg,
  }}>
    <span style={{ fontSize: 22 }}>{emoji}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: colors.textMuted }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{value}</div>
    </div>
  </div>
);

const ContactRow: FC<{ contact: { n: string; p: string }; role: string }> = ({ contact, role }) => (
  <a
    href={`tel:${contact.p}`}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 14,
      background: `${colors.primary}10`,
      border: `1.5px solid ${colors.primary}30`,
      textDecoration: 'none',
    }}
  >
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: colors.primary, color: colors.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
    }}>📞</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: colors.textMuted }}>{role}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{contact.n}</div>
      <div style={{ fontSize: 12, color: colors.primary, direction: 'ltr', textAlign: 'right' }}>{contact.p}</div>
    </div>
    <span style={{ fontSize: 11, color: colors.primary, fontWeight: 700 }}>اتصل ←</span>
  </a>
);
