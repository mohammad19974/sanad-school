// hook لجلب الملاجئ — أوّلاً OpenStreetMap (أماكن حقيقيّة)، ثم Firestore، ثم fallback وهمي

import { useEffect, useState } from 'react';
import { fetchNearbyShelters, fallbackShelters } from '../api/sheltersApi';
import { fetchOsmSheltersCached } from '../api/overpassApi';
import type { Shelter } from '../types';

interface Result {
  shelters: Shelter[];
  loading:  boolean;
  /** مصدر البيانات الحالي — للعرض في الـ UI */
  source:   'osm' | 'firestore' | 'fallback' | 'none';
}

export const useShelters = (lat?: number, lng?: number): Result => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading]   = useState(true);
  const [source, setSource]     = useState<Result['source']>('none');

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      // eslint-disable-next-line no-console
      console.info('[useShelters] 🔍 يبحث عن ملاجئ قرب', lat.toFixed(4), lng.toFixed(4));

      // 1) جرّب OpenStreetMap أولاً (أماكن حقيقيّة)
      try {
        const osm = await fetchOsmSheltersCached(lat, lng);
        // eslint-disable-next-line no-console
        console.info('[useShelters] OSM أرجع', osm.length, 'مكان');
        if (cancelled) return;
        if (osm.length > 0) {
          setShelters(osm);
          setSource('osm');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[useShelters] ❌ OSM فشل:', err);
      }

      // 2) Firestore (ملاجئ مُدارَة يدوياً من المدرسة)
      try {
        const fs = await fetchNearbyShelters(lat, lng);
        // eslint-disable-next-line no-console
        console.info('[useShelters] Firestore أرجع', fs.length, 'ملجأ');
        if (cancelled) return;
        if (fs.length > 0) {
          setShelters(fs);
          setSource('firestore');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[useShelters] ❌ Firestore فشل:', err);
      }

      // 3) Fallback وهمي
      // eslint-disable-next-line no-console
      console.warn('[useShelters] ⚠️ يستخدم بيانات وهميّة — تحقّق من اتصال OSM');
      if (cancelled) return;
      setShelters(fallbackShelters(lat, lng));
      setSource('fallback');
      setLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [lat, lng]);

  return { shelters, loading, source };
};
