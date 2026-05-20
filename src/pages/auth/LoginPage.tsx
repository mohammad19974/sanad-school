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
import { useLanguage } from '../../context/LanguageContext';
import { toE164 } from '../../helpers/formatters';
import { isValidIsraeliPhone } from '../../helpers/validators';
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
  const { t, lang, setLang } = useLanguage();

  const submitEmail = async () => {
    setError(null);
    if (!email.includes('@')) { setError(lang === 'he' ? 'הזן דוא"ל תקין' : 'أدخل بريداً صحيحاً'); return; }
    if (password.length < 6) { setError(lang === 'he' ? 'הסיסמה חייבת להכיל לפחות 6 תווים' : 'كلمة المرور 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success(lang === 'he' ? 'ברוך שובך' : 'مرحباً بعودتك');
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
    if (!isValidIsraeliPhone(phone)) {
      const msg = lang === 'he' ? 'מספר טלפון לא חוקי. דוגמה: 0501234567' : 'رقم الهاتف غير صحيح. مثال: 0501234567';
      setError(msg);
      toast.warning(msg);
      return;
    }
    setLoading(true);
    try {
      const e164 = toE164(phone, 'IL');
      window.__sanadConfirmation = await requestOtp(e164);
      toast.info(lang === 'he' ? 'קוד האימות נשלח' : 'تم إرسال رمز التحقّق');
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
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.text, marginTop: 14 }}>{t('app.name')}</div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>
              {lang === 'he' ? 'אפליקציית חירום בית-ספרית' : 'تطبيق الطوارئ المدرسية'}
            </div>

            {/* مبدّل اللغة */}
            <div style={{
              display: 'inline-flex', gap: 4, marginTop: 12, padding: 3,
              background: colors.bgCard, borderRadius: 50,
              border: `1.5px solid ${colors.bgDark}`,
            }}>
              {(['ar', 'he'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { void setLang(l); }}
                  style={{
                    padding: '5px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                    background: lang === l ? colors.primary : 'transparent',
                    color: lang === l ? colors.white : colors.textMuted,
                    fontFamily, fontSize: 12, fontWeight: 700,
                  }}
                >{t(l === 'ar' ? 'lang.ar' : 'lang.he')}</button>
              ))}
            </div>
          </div>

          {/* اختيار الطريقة */}
          <div style={{
            display: 'flex', background: colors.bgCard, borderRadius: 14,
            padding: 4, border: `1.5px solid ${colors.bgDark}`,
          }}>
            <TabBtn active={method === 'email'} onClick={() => setMethod('email')}>
              📧 {lang === 'he' ? 'דוא"ל' : 'البريد'}
            </TabBtn>
            <TabBtn active={method === 'phone'} onClick={() => setMethod('phone')}>
              📱 {lang === 'he' ? 'טלפון' : 'الهاتف'}
            </TabBtn>
          </div>

          {/* النموذج */}
          {method === 'email' ? (
            <>
              <Field
                label={t('auth.email')} type="email"
                value={email} onChange={setEmail}
                placeholder="name@example.com"
              />
              <Field
                label={t('auth.password')} type="password"
                value={password} onChange={setPassword}
                placeholder="••••••••"
              />
            </>
          ) : (
            <>
              <Field
                label={t('profile.field.phone')} type="tel"
                value={phone} onChange={setPhone}
                placeholder="050 123 4567"
              />
              <div id="recaptcha-container" />
              <div style={{ fontSize: 11, color: colors.warning, padding: '4px 8px' }}>
                {lang === 'he'
                  ? '⚠️ הרשמת טלפון דורשת תוכנית Blaze ב-Firebase'
                  : '⚠️ تسجيل الهاتف يحتاج تفعيل خطة Blaze في Firebase'}
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
            {loading
              ? t('common.loading')
              : method === 'email'
                ? t('auth.signin')
                : (lang === 'he' ? 'שלח קוד אימות' : 'إرسال رمز التحقّق')}
          </PillButton>

          {method === 'email' && (
            <div style={{ textAlign: 'center', fontSize: 13, color: colors.textMuted }}>
              {t('auth.no.account')} {' '}
              <Link to="/auth/register" style={{ color: colors.primary, fontWeight: 700 }}>
                {t('auth.signup')}
              </Link>
            </div>
          )}

          <p style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>
            {lang === 'he'
              ? 'בכניסה אתה מסכים לתנאי השימוש ולמדיניות הפרטיות'
              : 'بتسجيل الدخول، توافق على شروط الاستخدام وسياسة الخصوصية'}
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
