// صفحة ملف المنسّق — معلومات أساسية + إحصائيات + تسجيل خروج

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { useAuthContext } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import { useStaffSosList } from '../../hooks/useStaffSosList';
import { signOut } from '../../api/authApi';
import { useToast } from '../../hooks/useToast';
import { colors, fontFamily } from '../../theme/tokens';

export const StaffProfilePage: FC = () => {
  const { user } = useAuthContext();
  const { profile, save } = useProfileContext();
  const { active, acknowledged, resolved } = useStaffSosList();
  const toast = useToast();
  const history = useHistory();

  const [editing, setEditing] = useState(false);
  const [name, setName]             = useState(profile?.name ?? '');
  const [staffTitle, setStaffTitle] = useState(profile?.staffTitle ?? '');
  const [saving, setSaving]         = useState(false);

  const persist = async () => {
    setSaving(true);
    try {
      await save({ name: name.trim(), staffTitle: staffTitle.trim() });
      toast.success('تم حفظ المعلومات');
      setEditing(false);
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); toast.info('تم تسجيل الخروج'); history.replace('/auth/login'); }
    catch { toast.error('فشل تسجيل الخروج'); }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bgSettings }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bgSettings, fontFamily, direction: 'rtl',
        }}>
          {/* رأس */}
          <div style={{
            padding: '20px 16px 18px',
            background: `linear-gradient(160deg, ${colors.primary}, ${colors.primaryDark})`,
            color: colors.white,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 70, height: 70, borderRadius: 22,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                <Icon name="shield" size={36} color={colors.white} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 800 }}>
                  {profile?.name || 'منسّق طوارئ'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                  {profile?.staffTitle || 'منسّق استجابة'}
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={() => editing ? persist() : setEditing(true)}
                disabled={saving}
                style={{
                  padding: '8px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.25)', border: 'none',
                  cursor: saving ? 'default' : 'pointer',
                  color: colors.white, fontFamily, fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 5,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Icon name={editing ? 'save' : 'edit'} size={14} color={colors.white} />
                {saving ? 'جاري...' : editing ? 'حفظ' : 'تعديل'}
              </button>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            {/* إحصائيات */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Stat label="نشطة"    value={active.length}        color={colors.danger} />
              <Stat label="مُستلَمة" value={acknowledged.length} color={colors.accent} />
              <Stat label="منتهية"  value={resolved.length}      color={colors.success} />
            </div>

            {/* معلومات */}
            <SectionTitle>المعلومات الأساسية</SectionTitle>
            <Section>
              <Field
                label="الاسم الكامل"
                value={name}
                editing={editing}
                onChange={setName}
                placeholder="مثل: أحمد محمد"
              />
              <Field
                label="المسمّى الوظيفي"
                value={staffTitle}
                editing={editing}
                onChange={setStaffTitle}
                placeholder="مثل: منسّق طوارئ — القمة الثانوية"
                last
              />
            </Section>

            {/* بطاقة فيكتور — معلومات الحساب */}
            <SectionTitle>الحساب</SectionTitle>
            <Section>
              <ReadOnlyRow icon="phone" label="البريد الإلكتروني" value={user?.email ?? '—'} />
              <ReadOnlyRow icon="shield" label="الدور" value="منسّق طوارئ" />
              <ReadOnlyRow icon="user" label="مُعرّف المستخدم" value={user?.uid.slice(0, 16) + '...' || ''} last />
            </Section>

            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent', border: `1.5px solid ${colors.danger}`,
                color: colors.danger, padding: '12px', borderRadius: 14,
                fontFamily, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                marginTop: 6,
              }}>
              ⏻ تسجيل الخروج
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─── مكوّنات مساعدة ─────────────────────────────────

const Stat: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    flex: 1, padding: 14, borderRadius: 14,
    background: `${color}15`, border: `1px solid ${color}30`,
    textAlign: 'center', fontFamily,
  }}>
    <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>{label}</div>
  </div>
);

const SectionTitle: FC<{ children: string }> = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: colors.textMuted,
    fontFamily, padding: '2px 6px',
  }}>{children}</div>
);

const Section: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    borderRadius: 16, overflow: 'hidden',
    background: colors.bgCard, boxShadow: `0 2px 8px ${colors.cardShadow}`,
  }}>{children}</div>
);

interface FieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder: string;
  last?: boolean;
}
const Field: FC<FieldProps> = ({ label, value, editing, onChange, placeholder, last }) => (
  <div style={{
    padding: '12px 14px',
    borderBottom: last ? 'none' : `1px solid ${colors.bgDark}`,
  }}>
    <div style={{ fontSize: 10, color: colors.textMuted, fontFamily, marginBottom: 4 }}>{label}</div>
    {editing ? (
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', border: 'none', outline: 'none',
          fontSize: 14, fontFamily, background: 'transparent',
          color: colors.text, fontWeight: 600, textAlign: 'right',
        }}
      />
    ) : (
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily, color: value ? colors.text : colors.textLight }}>
        {value || placeholder}
      </div>
    )}
  </div>
);

interface ReadOnlyRowProps {
  icon: import('../../ui/Icon').IconName;
  label: string;
  value: string;
  last?: boolean;
}
const ReadOnlyRow: FC<ReadOnlyRowProps> = ({ icon, label, value, last }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px',
    borderBottom: last ? 'none' : `1px solid ${colors.bgDark}`,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: `${colors.primary}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={icon} size={15} color={colors.primary} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: colors.textMuted, fontFamily }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily }}>{value}</div>
    </div>
  </div>
);
