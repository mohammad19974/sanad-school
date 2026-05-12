// صفحة إنشاء حساب — مع اختيار الدور (طالب أو منسّق طوارئ)

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, Link } from 'react-router-dom';
import { PillButton } from '../../ui/PillButton';
import { Icon } from '../../ui/Icon';
import { signUpWithEmail, authErrorMessage } from '../../api/authApi';
import { updateProfile } from '../../api/profileApi';
import { useToast } from '../../hooks/useToast';
import { colors, fontFamily } from '../../theme/tokens';
import type { UserRole } from '../../types';
import type { FirebaseError } from 'firebase/app';

export const RegisterPage: FC = () => {
  const [role, setRole]         = useState<UserRole>('student');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const history = useHistory();
  const toast = useToast();

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2)  { warn('أدخل اسماً صحيحاً'); return; }
    if (!email.includes('@'))    { warn('أدخل بريداً صحيحاً'); return; }
    if (password.length < 6)     { warn('كلمة المرور 6 أحرف على الأقل'); return; }
    if (password !== confirm)    { warn('كلمتا المرور غير متطابقتين'); return; }

    setLoading(true);
    try {
      const user = await signUpWithEmail(email, password, name.trim());
      // اضبط الدور في الملف
      await updateProfile(user.uid, {
        role,
        name: name.trim(),
        email,
      });
      toast.success(role === 'staff' ? 'مرحباً بك يا منسّق' : 'تم إنشاء الحساب بنجاح');
      history.replace(role === 'staff' ? '/staff/dashboard' : '/tabs/home');
    } catch (err) {
      const msg = authErrorMessage((err as FirebaseError).code || '');
      setError(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const warn = (m: string) => { setError(m); toast.warning(m); };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          padding: '36px 24px', gap: 14, justifyContent: 'center',
          fontFamily, direction: 'rtl',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div style={{
              display: 'inline-flex', width: 64, height: 64, borderRadius: 20,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="user" size={32} color={colors.white} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginTop: 10 }}>
              إنشاء حساب جديد
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>سجّل لتفعيل خدمات النجدة</div>
          </div>

          {/* اختيار الدور */}
          <div>
            <label style={{ fontSize: 12, color: colors.textMuted, display: 'block', marginBottom: 8 }}>
              نوع الحساب
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <RoleCard
                active={role === 'student'}
                icon="user"
                title="طالب"
                desc="أحتاج الحماية"
                onClick={() => setRole('student')}
              />
              <RoleCard
                active={role === 'staff'}
                icon="shield"
                title="منسّق طوارئ"
                desc="مسؤول استجابة"
                onClick={() => setRole('staff')}
              />
            </div>
          </div>

          <Field label="الاسم الكامل" type="text"
            value={name} onChange={setName} placeholder="مثل: أحمد محمد" />
          <Field label="البريد الإلكتروني" type="email"
            value={email} onChange={setEmail} placeholder="name@example.com" />
          <Field label="كلمة المرور" type="password"
            value={password} onChange={setPassword} placeholder="6 أحرف على الأقل" />
          <Field label="تأكيد كلمة المرور" type="password"
            value={confirm} onChange={setConfirm} placeholder="أعد كلمة المرور" />

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: `${colors.danger}15`, color: colors.danger, fontSize: 13,
            }}>{error}</div>
          )}

          <PillButton onClick={submit} disabled={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </PillButton>

          <div style={{ textAlign: 'center', fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            لديك حساب بالفعل؟{' '}
            <Link to="/auth/login" style={{ color: colors.primary, fontWeight: 700 }}>
              سجّل دخولك
            </Link>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

interface RoleCardProps {
  active: boolean;
  icon: import('../../ui/Icon').IconName;
  title: string;
  desc: string;
  onClick: () => void;
}
const RoleCard: FC<RoleCardProps> = ({ active, icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '12px 10px', borderRadius: 14, cursor: 'pointer',
      background: active ? `${colors.primary}15` : colors.bgCard,
      border: `2px solid ${active ? colors.primary : colors.bgDark}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      fontFamily,
      transition: 'all 0.2s',
    }}
  >
    <div style={{
      width: 38, height: 38, borderRadius: 12,
      background: active ? colors.primary : `${colors.primary}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={icon} size={20} color={active ? colors.white : colors.primary} />
    </div>
    <div style={{ fontSize: 13, fontWeight: 800, color: colors.text }}>{title}</div>
    <div style={{ fontSize: 10, color: colors.textMuted }}>{desc}</div>
  </button>
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
        width: '100%', padding: '13px 16px', borderRadius: 14,
        border: `1.5px solid ${colors.bgDark}`, background: colors.bgCard,
        fontSize: 16, fontFamily, textAlign: 'right',
        outline: 'none', color: colors.text,
      }}
    />
  </div>
);
