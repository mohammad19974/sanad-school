// hook لإدارة الإشعارات — بيانات تجريبية محلياً، قابلة للاستبدال بـ Firestore لاحقاً

import { useCallback, useState } from 'react';
import type { AppNotification } from '../types';

// ─── بيانات تجريبية ─────────────────────────────
// لاحقاً يمكن استبدالها بـ onSnapshot من Firestore: /students/{uid}/notifications
const SAMPLE: AppNotification[] = [
  {
    id: 'n1',
    kind: 'drill',
    title: 'تمرين إخلاء غداً',
    body: 'الساعة 10:30 صباحاً — كن في صفّك وانتظر التعليمات.',
    createdAt: Date.now() - 1000 * 60 * 30,
    read: false,
  },
  {
    id: 'n2',
    kind: 'family',
    title: 'ولي الأمر يطمئن عليك',
    body: 'وصلت رسالة من والدك: "هل أنت بخير؟"',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    id: 'n3',
    kind: 'shelter',
    title: 'ملجأ جديد قريب منك',
    body: 'تم إضافة "القمة الثانوية" إلى قائمة الملاجئ.',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    read: true,
  },
  {
    id: 'n4',
    kind: 'school',
    title: 'تذكير من المنسّق',
    body: 'حدّث بيانات بطاقة الطوارئ الطبية إن لزم الأمر.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
  },
  {
    id: 'n5',
    kind: 'info',
    title: 'تمّ تفعيل سند بنجاح',
    body: 'أهلاً بك في تطبيق سند. زر النجدة في الصفحة الرئيسية لأي مساعدة.',
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    read: true,
  },
];

interface Result {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotifications = (): Result => {
  const [notifications, setNotifications] = useState<AppNotification[]>(SAMPLE);

  const markRead = useCallback((id: string) => {
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, clearAll };
};
