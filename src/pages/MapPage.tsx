// صفحة الخريطة — تعرض موقع المستخدم وأقرب الملاجئ

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { LeafletMap } from '../components/map/LeafletMap';
import { ShelterListItem } from '../components/map/ShelterListItem';
import { useGeolocation } from '../hooks/useGeolocation';
import { useShelters } from '../hooks/useShelters';
import { colors, fontFamily } from '../theme/tokens';

export const MapPage: FC = () => {
  const { coords } = useGeolocation();
  const { shelters, loading } = useShelters(coords?.lat, coords?.lng);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          <div style={{ padding: '20px 20px 6px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>أقرب الملاجئ الآمنة</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>
              {loading ? 'جاري تحديد موقعك...' : 'موقعك محدد تلقائياً'}
            </div>
          </div>

          {/* الخريطة */}
          <div style={{
            margin: '0 16px', height: 240, borderRadius: 20,
            overflow: 'hidden', position: 'relative',
            border: `2px solid ${colors.primaryLight}50`,
          }}>
            {coords && (
              <LeafletMap
                userLat={coords.lat}
                userLng={coords.lng}
                shelters={shelters}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId((curr) => curr === id ? null : id)}
              />
            )}
          </div>

          {/* قائمة الملاجئ */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {shelters.map((s) => (
              <ShelterListItem
                key={s.id}
                shelter={s}
                selected={selectedId === s.id}
                onSelect={(id) => setSelectedId((curr) => curr === id ? null : id)}
              />
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
