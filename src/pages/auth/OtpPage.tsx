// صفحة التحقّق من رمز OTP

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { PillButton } from '../../ui/PillButton';
import { verifyOtp } from '../../api/authApi';
import { isValidOtp } from '../../helpers/validators';
import { colors, fontFamily } from '../../theme/tokens';

export const OtpPage: FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const submit = async () => {
    setError(null);
    if (!isValidOtp(code)) {
      setError('الرمز يجب أن يكون 6 أرقام');
      return;
    }
    const confirmation = window.__sanadConfirmation;
    if (!confirmation) {
      setError('انتهت الجلسة. أعد إدخال الرقم.');
      history.replace('/auth/login');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(confirmation, code);
      window.__sanadConfirmation = undefined;
      history.replace('/tabs/home');
    } catch (err) {
      console.error(err);
      setError('الرمز غير صحيح. أعد المحاولة.');
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
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>التحقّق</div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
              أدخل الرمز المُرسل إلى جوّالك
            </div>
          </div>

          <input
            type="tel"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
            style={{
              padding: '18px 16px', borderRadius: 14,
              border: `1.5px solid ${colors.bgDark}`, background: colors.bgCard,
              fontSize: 24, fontFamily, textAlign: 'center',
              letterSpacing: '0.4em', outline: 'none', color: colors.text,
            }}
          />

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: `${colors.danger}15`, color: colors.danger, fontSize: 13,
            }}>{error}</div>
          )}

          <PillButton onClick={submit} disabled={loading}>
            {loading ? 'جاري التحقّق...' : 'تأكيد'}
          </PillButton>

          <button
            onClick={() => history.replace('/auth/login')}
            style={{
              background: 'transparent', border: 'none', color: colors.primary,
              fontFamily, fontSize: 13, cursor: 'pointer',
            }}>
            تغيير الرقم
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};
