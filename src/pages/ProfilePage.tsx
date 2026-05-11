// صفحة الملف الشخصي — معلومات شخصية، طبية، وإمكانية وصول

import { useEffect, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { ProfileField } from '../components/profile/ProfileField';
import { ChipSelector } from '../components/profile/ChipSelector';
import { Toggle } from '../ui/Toggle';
import { Icon } from '../ui/Icon';
import { useProfileContext } from '../context/ProfileContext';
import { signOut } from '../api/authApi';
import { useHistory } from 'react-router-dom';
import { colors, fontFamily } from '../theme/tokens';
import {
  emptyProfile, type StudentProfile,
  type GradeLevel, type DisabilityType, type BloodType,
} from '../types';

const GRADES: readonly GradeLevel[] = ['الصف العاشر', 'الصف الحادي عشر', 'الصف الثاني عشر'];
const DISABILITIES: readonly DisabilityType[] = ['اضطراب طيف التوحد', 'إعاقة حركية', 'كلاهما'];
const BLOODS: readonly BloodType[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const ProfilePage: FC = () => {
  const { profile, save } = useProfileContext();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StudentProfile>(profile ?? emptyProfile(''));
  const history = useHistory();

  useEffect(() => { if (profile) setDraft(profile); }, [profile]);

  const persist = async () => {
    await save(draft);
    setEditing(false);
  };

  const setField = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setGuardian = (patch: Partial<StudentProfile['guardian']>) => {
    setDraft((prev) => ({ ...prev, guardian: { ...prev.guardian, ...patch } }));
  };

  const setSetting = (key: keyof StudentProfile['settings'], value: boolean) => {
    setDraft((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bgSettings }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bgSettings, fontFamily, direction: 'rtl',
        }}>
          {/* رأس */}
          <div style={{ padding: '20px 20px 14px', background: colors.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 66, height: 66, borderRadius: 22,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="user" size={32} color={colors.white} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
                  {draft.name || 'الطالب'}
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>
                  {draft.grade || 'الصف الدراسي'} · {draft.disability || 'نوع الإعاقة'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.success }} />
                  <span style={{ fontSize: 11, color: colors.success, fontWeight: 600 }}>حالة: آمن</span>
                </div>
              </div>
              <button
                onClick={() => editing ? persist() : setEditing(true)}
                style={{
                  padding: '8px 14px', borderRadius: 12,
                  background: editing ? colors.primary : `${colors.primary}18`,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Icon name={editing ? 'save' : 'edit'} size={15} color={editing ? colors.white : colors.primary} />
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily,
                  color: editing ? colors.white : colors.primary,
                }}>
                  {editing ? 'حفظ' : 'تعديل'}
                </span>
              </button>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <SectionTitle>المعلومات الشخصية</SectionTitle>
            <Section>
              <ProfileField label="الاسم الكامل" icon="user" value={draft.name}
                placeholder="أدخل اسمك" editing={editing}
                onChange={(v) => setField('name', v)} />
              <ProfileField label="رقم الهوية" icon="shield" value={draft.id}
                placeholder="أدخل رقم الهوية" editing={editing}
                onChange={(v) => setField('id', v)} />
              <ProfileField label="رقم الجوال" icon="phone" value={draft.phone}
                placeholder="+966" type="tel" editing={editing}
                onChange={(v) => setField('phone', v)} />
              <ChipSelector label="الصف الدراسي" options={GRADES} value={draft.grade}
                editing={editing} onChange={(v) => setField('grade', v)} />
              <ChipSelector label="نوع الإعاقة" options={DISABILITIES} value={draft.disability}
                editing={editing} onChange={(v) => setField('disability', v)} />
            </Section>

            <SectionTitle>المعلومات الطبية</SectionTitle>
            <Section>
              <ChipSelector label="فصيلة الدم" options={BLOODS} value={draft.blood}
                editing={editing} variant="square" activeColor={colors.danger}
                onChange={(v) => setField('blood', v)} />
              <ProfileField label="الأدوية الدائمة" icon="brain" value={draft.meds}
                placeholder="مثل: ريتالين 10 مجم" editing={editing}
                onChange={(v) => setField('meds', v)} />
              <ProfileField label="الحساسية" icon="bell" value={draft.allergies}
                placeholder="مثل: بنسلين، فول السودان" editing={editing}
                onChange={(v) => setField('allergies', v)} />
              <ProfileField label="اسم ولي الأمر" icon="family" value={draft.guardian.name}
                placeholder="اسم ولي الأمر" editing={editing}
                onChange={(v) => setGuardian({ name: v })} />
              <ProfileField label="رقم ولي الأمر" icon="phone" value={draft.guardian.phone}
                placeholder="+966" type="tel" editing={editing}
                onChange={(v) => setGuardian({ phone: v })} />
            </Section>

            <SectionTitle>إمكانية الوصول</SectionTitle>
            <Section>
              <SettingRow
                label="الإدخال الصوتي" icon="mic"
                value={draft.settings.voiceInput}
                onChange={(v) => setSetting('voiceInput', v)} />
              <SettingRow
                label="إشعارات الطوارئ" icon="bell"
                value={draft.settings.notify}
                onChange={(v) => setSetting('notify', v)} />
              <SettingRow
                label="النصوص الكبيرة" icon="brain"
                value={draft.settings.largeText}
                onChange={(v) => setSetting('largeText', v)}
                last />
            </Section>

            {/* بطاقة طوارئ */}
            <div style={{
              borderRadius: 18, padding: '14px 16px',
              background: colors.primary, boxShadow: `0 4px 16px ${colors.pulse}`,
              display: 'flex', alignItems: 'center', gap: 12,
              marginTop: 8,
            }}>
              <Icon name="shield" size={26} color={colors.white} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.white }}>
                  بطاقة الطوارئ الطبية
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                  تُعرض تلقائياً في حالة الطوارئ
                </div>
              </div>
            </div>

            <button
              onClick={async () => { await signOut(); history.replace('/auth/login'); }}
              style={{
                background: 'transparent', border: `1.5px solid ${colors.danger}`,
                color: colors.danger, padding: '10px', borderRadius: 14,
                fontFamily, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                marginTop: 10, marginBottom: 20,
              }}>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─── مكوّنات مساعدة محليّة ─────────────────────────

const SectionTitle: FC<{ children: string }> = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: colors.textMuted,
    fontFamily, padding: '2px 4px',
  }}>{children}</div>
);

const Section: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    borderRadius: 18, overflow: 'hidden',
    background: colors.bgCard,
    boxShadow: `0 2px 8px ${colors.cardShadow}`,
  }}>{children}</div>
);

const SettingRow: FC<{
  label: string;
  icon: import('../ui/Icon').IconName;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}> = ({ label, icon, value, onChange, last }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '13px 14px',
    borderBottom: last ? 'none' : `1px solid ${colors.bgDark}`,
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: `${colors.primary}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={icon} size={17} color={colors.primary} />
    </div>
    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: colors.text, fontFamily }}>
      {label}
    </span>
    <Toggle value={value} onChange={onChange} />
  </div>
);
