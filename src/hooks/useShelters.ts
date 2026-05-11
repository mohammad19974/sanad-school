// hook لجلب الملاجئ القريبة من موقع معطى

import { useEffect, useState } from 'react';
import { fetchNearbyShelters, fallbackShelters } from '../api/sheltersApi';
import type { Shelter } from '../types';

interface Result {
  shelters: Shelter[];
  loading: boolean;
}

export const useShelters = (lat?: number, lng?: number): Result => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    setLoading(true);

    fetchNearbyShelters(lat, lng)
      .then((list) => {
        if (cancelled) return;
        // إذا القاعدة فارغة، نعرض بيانات افتراضية للعرض التجريبي
        setShelters(list.length > 0 ? list : fallbackShelters(lat, lng));
      })
      .catch((err) => {
        console.warn('[useShelters] استخدام البيانات الاحتياطية:', err);
        if (!cancelled) setShelters(fallbackShelters(lat, lng));
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [lat, lng]);

  return { shelters, loading };
};
