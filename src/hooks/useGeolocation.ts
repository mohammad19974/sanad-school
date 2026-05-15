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

/** Fallback إذا رفض المتصفّح/فشل GPS — موقع القدس */
const FALLBACK_JERUSALEM: Coords = { lat: 31.7683, lng: 35.2137 };

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
      console.warn('[useGeolocation] تعذّر جلب الموقع، fallback للقدس:', err);
      setError('تعذّر الوصول لخدمة الموقع');
      setCoords(FALLBACK_JERUSALEM);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchOnce();
  }, [autoFetch, fetchOnce]);

  return { coords, error, loading, refresh: fetchOnce };
};
