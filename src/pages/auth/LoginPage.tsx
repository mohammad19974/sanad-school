// صفحة تسجيل الدخول — تدعم طريقتين بـ tab toggle:
// 1) البريد + كلمة المرور (الافتراضية، Spark plan)
// 2) رقم الهاتف + OTP (يحتاج Blaze)

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, Link } from 'react-router-dom';
import { PillButton } from '../../ui/PillButton';
import { Icon } from '../../ui/Icon';
import {
  signInWithEmail, requestOtp, authErrorMessage,
} from '../../api/authApi';
import { useToast } from '../../hooks/useToast';
import { toE164 } from '../../helpers/formatters';
import { isValidSaudiPhone } from '../../helpers/validators';
import { colors, fontFamily } from '../../theme/tokens';
import type { FirebaseError } from 'firebase/app';

// نُخزّن confirmation result مؤقتاً لتمريره لشاشة OTP
declare global {
  interface Window { __sanadConfirmation?: import('firebase/auth').ConfirmationResult; }
}

type Method = 'email' | 'phone';

export const LoginPage: FC = () => {
  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const toast = useToast();

  const submitEmail = async () => {
    setError(null);
    if (!email.includes('@')) { setError('أدخل بريداً صحيحاً'); return; }
    if (password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('مرحباً بعودتك');
      history.replace('/tabs/home');
    } catch (err) {
      const msg = authErrorMessage((err as FirebaseError).code || '');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitPhone = async () => {
    setError(null);
    if (!isValidSaudiPhone(phone)) {
      const msg = 'رقم الهاتف غير صحيح. مثال: 0512345678';
      setError(msg);
      toast.warning(msg);
      return;
    }
    setLoading(true);
    try {
      const e164 = toE164(phone, 'SA');
      window.__sanadConfirmation = await requestOtp(e164);
      toast.info('تم إرسال رمز التحقّق');
      history.push('/auth/otp');
    } catch (err) {
      const msg = authErrorMessage((err as FirebaseError).code || '');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          padding: '40px 24px', gap: 16, justifyContent: 'center',
          fontFamily, direction: 'rtl',
        }}>
          {/* الشعار */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
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

          {/* اختيار الطريقة */}
          <div style={{
            display: 'flex', background: colors.bgCard, borderRadius: 14,
            padding: 4, border: `1.5px solid ${colors.bgDark}`,
          }}>
            <TabBtn active={method === 'email'} onClick={() => setMethod('email')}>📧 البريد</TabBtn>
            <TabBtn active={method === 'phone'} onClick={() => setMethod('phone')}>📱 الهاتف</TabBtn>
          </div>

          {/* النموذج */}
          {method === 'email' ? (
            <>
              <Field
                label="البريد الإلكتروني" type="email"
                value={email} onChange={setEmail}
                placeholder="name@example.com"
              />
              <Field
                label="كلمة المرور" type="password"
                value={password} onChange={setPassword}
                placeholder="••••••••"
              />
            </>
          ) : (
            <>
              <Field
                label="رقم الجوال" type="tel"
                value={phone} onChange={setPhone}
                placeholder="05XXXXXXXX"
              />
              <div id="recaptcha-container" />
              <div style={{ fontSize: 11, color: colors.warning, padding: '4px 8px' }}>
                ⚠️ تسجيل الهاتف يحتاج تفعيل خطة Blaze في Firebase
              </div>
            </>
          )}

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: `${colors.danger}15`, color: colors.danger, fontSize: 13,
            }}>{error}</div>
          )}

          <PillButton
            onClick={method === 'email' ? submitEmail : submitPhone}
            disabled={loading}
          >
            {loading ? 'جاري...' : method === 'email' ? 'تسجيل الدخول' : 'إرسال رمز التحقّق'}
          </PillButton>

          {method === 'email' && (
            <div style={{ textAlign: 'center', fontSize: 13, color: colors.textMuted }}>
              ليس لديك حساب؟ {' '}
              <Link to="/auth/register" style={{ color: colors.primary, fontWeight: 700 }}>
                أنشئ حساباً
              </Link>
            </div>
          )}

          <p style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>
            بتسجيل الدخول، توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─── مكوّنات مساعدة ────────────────────────────────────

interface TabBtnProps { active: boolean; onClick: () => void; children: React.ReactNode; }
const TabBtn: FC<TabBtnProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none',
      background: active ? colors.primary : 'transparent',
      color: active ? colors.white : colors.textMuted,
      fontFamily, fontSize: 13, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.2s',
    }}
  >{children}</button>
);

interface FieldProps {
  label: string; type: string;
  value: string; onChange: (v: string) => void;
  placeholder: string;
}
const Field: FC<FieldProps> = ({ label, type, value, onChange, placeholder }) => (
  <div>
    <label style={{ fontSize: 12, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
      {label}
    </label>
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        border: `1.5px solid ${colors.bgDark}`, background: colors.bgCard,
        fontSize: 16, fontFamily, textAlign: 'right',
        outline: 'none', color: colors.text,
      }}
    />
  </div>
);
