// خريطة Leaflet مع OSM — تعرض موقع المستخدم والملاجئ
// يجلب CSS الخاص بـ Leaflet من index.html

import { useEffect, useRef, type FC } from 'react';
import L, { type Map as LeafletMapType, type Marker } from 'leaflet';
import { colors } from '../../theme/tokens';
import type { Shelter } from '../../types';

interface Props {
  userLat: number;
  userLng: number;
  shelters: Shelter[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

// أيقونة مخصّصة على شكل قطرة لكل ملجأ
const buildShelterIcon = (selected: boolean): L.DivIcon => {
  const bg = selected ? colors.primaryDark : colors.primary;
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${selected ? 38 : 30}px;
        height:${selected ? 38 : 30}px;
        background:${bg};
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 10px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="transform:rotate(45deg);color:#fff;font-weight:800;font-size:13px;">●</div>
      </div>`,
    iconSize: [selected ? 38 : 30, selected ? 38 : 30],
    iconAnchor: [selected ? 19 : 15, selected ? 38 : 30],
  });
};

// أيقونة موقع المستخدم — نقطة زرقاء
const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#2196F3;border:3px solid #fff;
    box-shadow:0 0 0 6px rgba(33,150,243,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const LeafletMap: FC<Props> = ({ userLat, userLng, shelters, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapType | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const userMarkerRef = useRef<Marker | null>(null);

  // تهيئة الخريطة لمرة واحدة
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [userLat, userLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLat, userLng]);

  // تحديث موقع المستخدم
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    }
  }, [userLat, userLng]);

  // مزامنة علامات الملاجئ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // إزالة العلامات القديمة
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    shelters.forEach((s) => {
      const marker = L.marker([s.lat, s.lng], {
        icon: buildShelterIcon(s.id === selectedId),
      })
        .addTo(map)
        .on('click', () => onSelect?.(s.id));
      markersRef.current[s.id] = marker;
    });
  }, [shelters, selectedId, onSelect]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
