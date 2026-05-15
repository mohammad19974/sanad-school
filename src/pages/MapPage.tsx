// صفحة الخريطة — تعرض موقع المستخدم وأماكن حقيقيّة من OpenStreetMap

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { LeafletMap } from '../components/map/LeafletMap';
import { ShelterListItem } from '../components/map/ShelterListItem';
import { useGeolocation } from '../hooks/useGeolocation';
import { useShelters } from '../hooks/useShelters';
import { colors, fontFamily } from '../theme/tokens';

const sourceLabel = (s: ReturnType<typeof useShelters>['source']): string => {
  switch (s) {
    case 'osm':       return '📍 من OpenStreetMap — أماكن حقيقيّة';
    case 'firestore': return '🏫 من قاعدة بيانات المدرسة';
    case 'fallback':  return '⚠️ بيانات تجريبيّة (لا يوجد اتصال)';
    default:          return 'جاري البحث...';
  }
};

export const MapPage: FC = () => {
  const { coords, refresh } = useGeolocation();
  const { shelters, loading, source } = useShelters(coords?.lat, coords?.lng);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          <div style={{
            padding: '20px 20px 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>أقرب الملاجئ الآمنة</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {loading
                  ? '🔍 جاري البحث عن أماكن حقيقيّة قرب موقعك...'
                  : `${shelters.length} موقع • ${sourceLabel(source)}`}
              </div>
              {coords && (
                <div style={{ fontSize: 10, color: colors.textLight, marginTop: 2, direction: 'ltr', textAlign: 'right' }}>
                  📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </div>
              )}
            </div>
            <button
              onClick={() => { void refresh(); }}
              title="تحديث الموقع وإعادة البحث"
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${colors.primary}18`, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.primary, fontSize: 18, flexShrink: 0,
              }}
            >🔄</button>
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
            {loading && shelters.length === 0 ? (
              <div style={{
                padding: 30, textAlign: 'center',
                color: colors.textMuted, fontSize: 13, fontFamily,
              }}>
                🔍 جاري جلب أماكن حقيقيّة من OpenStreetMap...
              </div>
            ) : (
              shelters.map((s) => (
                <ShelterListItem
                  key={s.id}
                  shelter={s}
                  selected={selectedId === s.id}
                  onSelect={(id) => setSelectedId((curr) => curr === id ? null : id)}
                />
              ))
            )}

            {/* OSM attribution — مطلوب قانوناً */}
            {source === 'osm' && shelters.length > 0 && (
              <div style={{
                fontSize: 10, color: colors.textLight, fontFamily,
                textAlign: 'center', padding: '12px 0 4px',
              }}>
                البيانات © مساهمو{' '}
                <a href="https://www.openstreetmap.org/copyright"
                   target="_blank" rel="noopener noreferrer"
                   style={{ color: colors.primary }}>
                  OpenStreetMap
                </a>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
