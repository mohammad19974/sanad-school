// صفحة إدخال رقم الهاتف لتسجيل الدخول

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { PillButton } from '../../ui/PillButton';
import { Icon } from '../../ui/Icon';
import { requestOtp } from '../../api/authApi';
import { toE164 } from '../../helpers/formatters';
import { isValidSaudiPhone } from '../../helpers/validators';
import { colors, fontFamily } from '../../theme/tokens';

// نخزّن confirmation result مؤقتاً في window لتمريره لشاشة OTP
declare global {
  interface Window { __sanadConfirmation?: import('firebase/auth').ConfirmationResult; }
}

export const LoginPage: FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const submit = async () => {
    setError(null);
    if (!isValidSaudiPhone(phone)) {
      setError('رقم الهاتف غير صحيح. مثال: 0512345678');
      return;
    }
    setLoading(true);
    try {
      const e164 = toE164(phone, 'SA');
      window.__sanadConfirmation = await requestOtp(e164);
      history.push('/auth/otp');
    } catch (err) {
      console.error(err);
      setError('فشل إرسال الرمز. تأكّد من الاتصال وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          padding: '40px 24px', gap: 20, justifyContent: 'center',
          fontFamily, direction: 'rtl',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', width: 80, height: 80, borderRadius: 26,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${colors.pulse}`,
            }}>
              <Icon name="shield" size={42} color={colors.white} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.text, marginTop: 14 }}>سند</div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>تطبيق الطوارئ المدرسية</div>
          </div>

          <label style={{ fontSize: 13, color: colors.textMuted }}>رقم الجوال</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XXXXXXXX"
            style={{
              padding: '14px 16px', borderRadius: 14,
              border: `1.5px solid ${colors.bgDark}`, background: colors.bgCard,
              fontSize: 16, fontFamily, textAlign: 'right',
              outline: 'none', color: colors.text,
            }}
          />

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: `${colors.danger}15`, color: colors.danger,
              fontSize: 13,
            }}>{error}</div>
          )}

          <div id="recaptcha-container" />

          <PillButton onClick={submit} disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </PillButton>

          <p style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>
            بتسجيل الدخول، توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};
