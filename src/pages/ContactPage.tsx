// صفحة جهات الاتصال للطوارئ

import type { FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { ContactCard, type EmergencyContact } from '../components/contact/ContactCard';
import { Icon } from '../ui/Icon';
import { useProfileContext } from '../context/ProfileContext';
import { colors, fontFamily } from '../theme/tokens';

const STATIC_CONTACTS: EmergencyContact[] = [
  { name: 'الدفاع المدني', number: '998', icon: 'fire',      color: '#E53935', desc: 'الإنقاذ والحرائق' },
  { name: 'الإسعاف',       number: '997', icon: 'ambulance', color: '#FF7043', desc: 'الحالات الطبية' },
  { name: 'الشرطة',        number: '999', icon: 'police',    color: '#1565C0', desc: 'الأمن والنجدة' },
];

export const ContactPage: FC = () => {
  const { profile } = useProfileContext();

  const personal: EmergencyContact[] = [];
  if (profile?.guardian.phone) {
    personal.push({
      name: profile.guardian.name || 'ولي الأمر',
      number: profile.guardian.phone,
      icon: 'family', color: colors.primary,
      desc: 'جهة تواصل طارئة',
    });
  }
  if (profile?.schoolCoordinator.phone) {
    personal.push({
      name: profile.schoolCoordinator.name || 'منسّق الطوارئ المدرسي',
      number: profile.schoolCoordinator.phone,
      icon: 'user', color: '#7B6FAD',
      desc: 'المدرسة والإرشاد',
    });
  }

  const all = [...STATIC_CONTACTS, ...personal];

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          <div style={{ padding: '20px 20px 6px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>التواصل الفوري</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>اتصل بلمسة واحدة</div>
          </div>

          <div style={{
            flex: 1, padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
            overflowY: 'auto',
          }}>
            {all.map((c, i) => (<ContactCard key={i} contact={c} />))}

            <button style={{
              width: '100%', padding: '15px', borderRadius: 16,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, cursor: 'pointer',
              boxShadow: `0 4px 16px ${colors.pulse}`,
              marginTop: 8,
            }}>
              <Icon name="mic" size={21} color={colors.white} />
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.white, fontFamily }}>
                اضغط وتكلم — سند يستمع
              </span>
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
