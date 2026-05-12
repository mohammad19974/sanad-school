// hook لإدارة Web Notifications — يعمل في المتصفّحات الحديثة + PWA
// يُظهر إشعار نظام التشغيل (OS notification) حتى لو كان tab في الخلفية
// ملاحظة: لا يعمل إذا كان tab مغلقاً تماماً (هذا يحتاج FCM + Cloud Function)

import { useCallback, useEffect, useState } from 'react';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

interface NotifyOptions {
  body?:    string;
  icon?:    string;
  tag?:     string;
  /** بيانات إضافيّة تصل لـ SW عند النقر */
  data?:    Record<string, unknown>;
  /** يبقى الإشعار حتى تفاعل المستخدم — مهمّ للطوارئ */
  requireInteraction?: boolean;
  /** نمط الاهتزاز (mobile) */
  vibrate?: number[];
}

interface Result {
  permission: NotificationPermissionState;
  isSupported: boolean;
  request: () => Promise<NotificationPermissionState>;
  notify: (title: string, options?: NotifyOptions) => Promise<void>;
}

const getInitialPermission = (): NotificationPermissionState => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
};

export const useWebNotifications = (): Result => {
  const [permission, setPermission] = useState<NotificationPermissionState>(getInitialPermission());
  const isSupported = permission !== 'unsupported';

  // مزامنة دوريّة (لو غيّر المستخدم الإذن من إعدادات المتصفّح)
  useEffect(() => {
    if (!isSupported) return;
    const id = window.setInterval(() => {
      const current = Notification.permission as NotificationPermissionState;
      setPermission((prev) => prev === current ? prev : current);
    }, 5000);
    return () => window.clearInterval(id);
  }, [isSupported]);

  const request = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!isSupported) return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionState);
      return result as NotificationPermissionState;
    } catch (err) {
      console.warn('[useWebNotifications] طلب الإذن فشل:', err);
      return Notification.permission as NotificationPermissionState;
    }
  }, [isSupported]);

  const notify = useCallback(async (
    title: string,
    options: NotifyOptions = {},
  ): Promise<void> => {
    if (!isSupported || permission !== 'granted') return;

    const payload: NotificationOptions = {
      body:    options.body,
      icon:    options.icon ?? '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     options.tag,
      data:    options.data ?? {},
      requireInteraction: options.requireInteraction ?? true,
      dir:     'rtl',
      lang:    'ar',
      // vibrate ليس في النوع لكنه مدعوم في Chrome Android
      ...(options.vibrate ? { vibrate: options.vibrate } : {}),
    } as NotificationOptions;

    try {
      // الأفضل: استخدام Service Worker لظهور أنظف ودعم النقر
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, payload);
      } else {
        new Notification(title, payload);
      }
    } catch (err) {
      console.warn('[useWebNotifications] فشل عرض الإشعار:', err);
    }
  }, [isSupported, permission]);

  return { permission, isSupported, request, notify };
};
