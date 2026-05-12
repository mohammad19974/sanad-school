// hook لمعرفة حالة الاتصال — يدمج navigator.onLine + Capacitor Network

import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export const useOnline = (): boolean => {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    // متصفّح
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capacitor (Android) — أكثر دقّة من navigator.onLine
    let removeHandle: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      Network.getStatus().then((status) => setOnline(status.connected)).catch(() => {});
      Network.addListener('networkStatusChange', (status) => {
        setOnline(status.connected);
      }).then((handle) => {
        removeHandle = () => handle.remove();
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (removeHandle) removeHandle();
    };
  }, []);

  return online;
};
