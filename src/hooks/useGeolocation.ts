// hook لجلب موقع المستخدم — يستخدم Capacitor على Android والمتصفّح على الويب

import { useCallback, useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface UseGeolocationResult {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/** يحاول جلب الموقع — يقع على fallback للرياض إذا فشل */
const FALLBACK_RIYADH: Coords = { lat: 24.7136, lng: 46.6753 };

export const useGeolocation = (autoFetch = true): UseGeolocationResult => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(autoFetch);

  const fetchOnce = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Capacitor يعمل على الجوّال والويب
      if (Capacitor.isNativePlatform()) {
        await Geolocation.requestPermissions();
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      });
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    } catch (err) {
      console.warn('[useGeolocation] تعذّر جلب الموقع، fallback للرياض:', err);
      setError('تعذّر الوصول لخدمة الموقع');
      setCoords(FALLBACK_RIYADH);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchOnce();
  }, [autoFetch, fetchOnce]);

  return { coords, error, loading, refresh: fetchOnce };
};
