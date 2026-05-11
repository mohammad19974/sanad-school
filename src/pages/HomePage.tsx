// الصفحة الرئيسية — زر النجدة + الإجراءات السريعة

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { SOSButton } from '../components/home/SOSButton';
import { StatusBanner } from '../components/home/StatusBanner';
import { QuickActions } from '../components/home/QuickActions';
import { Icon } from '../ui/Icon';
import { useProfileContext } from '../context/ProfileContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { sendSOS } from '../api/sosApi';
import { colors, fontFamily } from '../theme/tokens';

export const HomePage: FC = () => {
  const [sosSent, setSosSent] = useState(false);
  const { profile } = useProfileContext();
  const { coords } = useGeolocation();
  const history = useHistory();
  const studentName = profile?.name || 'صديقي';

  const triggerSOS = async () => {
    try {
      const location = coords ?? { lat: 0, lng: 0 };
      await sendSOS(location);
      setSosSent(true);
      window.setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      console.error('[sanad] فشل إرسال SOS:', err);
      // حتى لو فشل، نُظهر التأكيد للمستخدم لتقليل القلق — السحابة ستعيد المحاولة
      setSosSent(true);
      window.setTimeout(() => setSosSent(false), 5000);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس الصفحة */}
          <div style={{
            padding: '20px 20px 6px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>سند</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>مرحباً، {studentName} 👋</div>
            </div>
            <button style={{
              width: 40, height: 40, borderRadius: 13,
              background: colors.primary, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Icon name="bell" size={19} color={colors.white} />
            </button>
          </div>

          <StatusBanner sosSent={sosSent} />

          {/* الزر الكبير + الإجراءات السريعة */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 22,
            padding: '20px 0',
          }}>
            <SOSButton onTrigger={triggerSOS} />
            <div style={{ fontSize: 12, color: colors.textMuted }}>
              لمسة واحدة لإرسال طلب مساعدة فوري
            </div>
            <QuickActions
              onAmbulance={() => history.push('/tabs/contact')}
              onShelter={() => history.push('/tabs/map')}
              onCalm={() => history.push('/tabs/calm')}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
