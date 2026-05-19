// صفحة عرض البطاقة الطبيّة للممرّض/المسعف — تُفتح من QR
// لا تتطلّب تسجيل دخول، تقرأ البيانات من URL hash مباشرةً
// تعمل offline (محتوى ذاتي)

import { useEffect, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { decodeMedicalCard, type MedicalCardData } from '../helpers/medicalCardCodec';
import { MedicalCardView } from '../components/staff/MedicalCardView';
import { colors, fontFamily } from '../theme/tokens';

export const PublicMedicalCardPage: FC = () => {
  const [card, setCard] = useState<MedicalCardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) { setError('لا توجد بيانات في الرابط'); return; }
    const data = decodeMedicalCard(hash);
    if (!data) { setError('الرابط غير صالح أو تالف'); return; }
    setCard(data);
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.bg} 280px)`,
          fontFamily, direction: 'rtl',
        }}>
          <div style={{
            padding: '40px 20px 24px',
            color: colors.white, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>
              🩺 بطاقة طوارئ طبية
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>نبض</div>
          </div>

          <div style={{ padding: '0 16px 24px' }}>
            {error ? (
              <ErrorView msg={error} />
            ) : !card ? (
              <div style={{
                textAlign: 'center', color: colors.textMuted, padding: 30,
              }}>جاري قراءة البطاقة...</div>
            ) : (
              <MedicalCardView card={card} />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const ErrorView: FC<{ msg: string }> = ({ msg }) => (
  <div style={{
    background: colors.white, borderRadius: 20, padding: 30,
    textAlign: 'center', boxShadow: `0 8px 24px ${colors.cardShadow}`,
  }}>
    <div style={{ fontSize: 48 }}>❌</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginTop: 10 }}>
      تعذّر قراءة البطاقة
    </div>
    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>{msg}</div>
  </div>
);
