// صفحة عرض بطاقة الطوارئ الطبية مع QR — للطالب
// المستلِم (طبيب/ممرّض) يمسح QR بكاميرا الجوّال → تفتح صفحة عرض البطاقة

import { useMemo, useRef, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Icon } from '../ui/Icon';
import { useProfileContext } from '../context/ProfileContext';
import { useToast } from '../hooks/useToast';
import { encodeMedicalCard, buildCardUrl } from '../helpers/medicalCardCodec';
import { colors, fontFamily } from '../theme/tokens';

export const MedicalCardPage: FC = () => {
  const { profile } = useProfileContext();
  const history = useHistory();
  const toast = useToast();
  const qrRef = useRef<HTMLDivElement | null>(null);

  // ابنِ URL البطاقة مرّة واحدة عند تغيّر الملف
  const { url, encoded } = useMemo(() => {
    if (!profile) return { url: '', encoded: '' };
    const e = encodeMedicalCard(profile);
    return { url: buildCardUrl(e), encoded: e };
  }, [profile]);

  const handleShare = async () => {
    if (!navigator.share) {
      toast.warning('متصفّحك لا يدعم المشاركة المباشرة');
      try { await navigator.clipboard.writeText(url); toast.info('تم نسخ الرابط'); } catch { /* noop */ }
      return;
    }
    try {
      await navigator.share({
        title: 'بطاقة طوارئ طبية',
        text: `بطاقة طوارئ طبية لـ ${profile?.name || 'طالب'}`,
        url,
      });
    } catch { /* المستخدم ألغى — لا شيء */ }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط البطاقة');
    } catch {
      toast.error('فشل النسخ');
    }
  };

  const ready = !!profile && !!encoded;

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس */}
          <div style={{
            padding: '20px 16px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            background: colors.bgCard,
            borderBottom: `1px solid ${colors.bgDark}`,
            direction: 'rtl',
          }}>
            <button
              onClick={() => history.goBack()}
              className="no-print"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${colors.primary}18`, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: colors.primary, fontSize: 22, lineHeight: 1, fontWeight: 700 }}>›</span>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
                🩺 بطاقة الطوارئ الطبية
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                يمسحها الممرّض ليرى بياناتك الحيويّة فوراً
              </div>
            </div>
          </div>

          <div style={{
            flex: 1, padding: '16px 16px 24px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {!ready ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, padding: 30 }}>
                جاري تجهيز البطاقة...
              </div>
            ) : (
              <>
                {/* البطاقة المطبوعة */}
                <div
                  ref={qrRef}
                  className="medical-card-print"
                  style={{
                    background: colors.white,
                    borderRadius: 20,
                    padding: 20,
                    boxShadow: `0 8px 24px ${colors.cardShadow}`,
                    border: `2px solid ${colors.primary}30`,
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}
                >
                  {/* رأس البطاقة */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="shield" size={26} color={colors.white} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
                        نبض — بطاقة طوارئ طبية
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted }}>
                        Emergency Medical Card • {new Date().toLocaleDateString('ar')}
                      </div>
                    </div>
                  </div>

                  {/* الاسم البارز */}
                  <div style={{
                    padding: '14px 16px', borderRadius: 14,
                    background: `${colors.primary}10`,
                    borderRight: `4px solid ${colors.primary}`,
                  }}>
                    <div style={{ fontSize: 10, color: colors.textMuted }}>الاسم</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>
                      {profile.name || 'طالب'}
                    </div>
                  </div>

                  {/* الـ QR */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 12, background: colors.white,
                    borderRadius: 14, border: `2px dashed ${colors.bgDark}`,
                  }}>
                    <QRCodeSVG
                      value={url}
                      size={220}
                      level="M"
                      includeMargin={false}
                      fgColor={colors.primaryDark}
                      bgColor={colors.white}
                    />
                  </div>

                  <div style={{
                    fontSize: 11, color: colors.textMuted, textAlign: 'center',
                  }}>
                    📱 وجّه كاميرا الهاتف للـ QR لقراءة البطاقة كاملة
                  </div>

                  {/* المعلومات الحيويّة (للقراءة السريعة دون مسح) */}
                  <div style={{
                    borderTop: `1px dashed ${colors.bgDark}`, paddingTop: 12,
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    {profile.blood && (
                      <Row icon="🩸" label="فصيلة الدم" value={profile.blood} accent={colors.danger} />
                    )}
                    {profile.disability && (
                      <Row icon="🦮" label="نوع الإعاقة" value={profile.disability} />
                    )}
                    {profile.allergies && (
                      <Row icon="⚠️" label="الحساسية" value={profile.allergies} accent={colors.warning} />
                    )}
                    {profile.meds && (
                      <Row icon="💊" label="الأدوية" value={profile.meds} accent={colors.accent} />
                    )}
                    {profile.guardian?.phone && (
                      <Row icon="📞" label="ولي الأمر"
                        value={`${profile.guardian.name || ''} · ${profile.guardian.phone}`} />
                    )}
                  </div>
                </div>

                {/* أزرار الإجراءات — لا تُطبع */}
                <div className="no-print" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                }}>
                  <ActionBtn onClick={handleShare}     emoji="📤" text="مشاركة" />
                  <ActionBtn onClick={handlePrint}     emoji="🖨️" text="طباعة / حفظ PDF" />
                  <ActionBtn onClick={handleCopyUrl}   emoji="🔗" text="نسخ الرابط" />
                  <ActionBtn onClick={() => history.push('/tabs/profile')} emoji="✏️" text="تعديل البيانات" />
                </div>

                {/* ملاحظة الخصوصية */}
                <div className="no-print" style={{
                  fontSize: 11, color: colors.textMuted, padding: '10px 14px',
                  borderRadius: 10, background: `${colors.primary}08`, textAlign: 'center',
                  lineHeight: 1.7,
                }}>
                  🔒 البيانات مُضمَّنة داخل QR نفسه — لا تُرسَل لأيّ سيرفر.
                  أيّ شخص يمسح الـ QR يرى البطاقة فوراً بدون حساب.
                </div>
              </>
            )}
          </div>
        </div>

        {/* CSS الطباعة */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .medical-card-print { box-shadow: none !important; border: 1px solid #aaa !important; }
            body { background: white !important; }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

// ─── Row helper ─────────────────────────────────────
interface RowProps { icon: string; label: string; value: string; accent?: string; }
const Row: FC<RowProps> = ({ icon, label, value, accent }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 10,
    background: accent ? `${accent}10` : colors.bg,
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, color: colors.textMuted }}>{label}</div>
      <div style={{
        fontSize: 12, fontWeight: 700,
        color: accent || colors.text,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{value}</div>
    </div>
  </div>
);

interface ActionBtnProps { onClick: () => void; emoji: string; text: string; }
const ActionBtn: FC<ActionBtnProps> = ({ onClick, emoji, text }) => (
  <button
    onClick={onClick}
    style={{
      padding: '11px 10px', borderRadius: 14,
      background: colors.bgCard, border: `1.5px solid ${colors.bgDark}`,
      color: colors.text, fontFamily, fontSize: 12, fontWeight: 700,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}
  >
    <span>{emoji}</span>
    <span>{text}</span>
  </button>
);
