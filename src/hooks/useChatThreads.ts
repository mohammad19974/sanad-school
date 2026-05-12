// hook يربط طلبات SOS بآخر رسائلها — يبني قائمة "محادثات" Telegram-style
// يستخدم Firestore listeners حيّة لكل طلب (يحدّ القائمة بـ 50)

import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useStaffSosList } from './useStaffSosList';
import type { ChatMessage, SOSRequest, UserRole } from '../types';

export interface ChatThread {
  request:        SOSRequest;
  lastMessage:    ChatMessage | null;
  /** آخر نشاط (رسالة أو إنشاء الطلب) */
  lastActivityAt: number;
  hasUnread:      boolean;
}

// مفتاح localStorage لتتبّع آخر مشاهدة لكل محادثة
const lastSeenKey = (uid: string, requestId: string) => `sanad.chat.lastSeen.${uid}.${requestId}`;

export const getLastSeen = (uid: string, requestId: string): number => {
  const v = localStorage.getItem(lastSeenKey(uid, requestId));
  return v ? Number(v) : 0;
};

export const setLastSeen = (uid: string, requestId: string, ms: number = Date.now()): void => {
  localStorage.setItem(lastSeenKey(uid, requestId), String(ms));
};

interface Result {
  threads: ChatThread[];
  loading: boolean;
  totalUnread: number;
}

/** myRole + myUid لحساب unread بشكل صحيح (الرسائل من الطرف الآخر فقط) */
export const useChatThreads = (myUid: string | undefined, myRole: UserRole): Result => {
  const { requests, loading } = useStaffSosList();
  const [lastMsgs, setLastMsgs] = useState<Record<string, ChatMessage | null>>({});

  // اشترك في آخر رسالة لكل طلب
  useEffect(() => {
    if (requests.length === 0) return;
    const unsubs = requests.map((req) => {
      const q = query(
        collection(db, 'sosRequests', req.id, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(1),
      );
      return onSnapshot(q, (snap) => {
        const docSnap = snap.docs[0];
        const msg: ChatMessage | null = docSnap
          ? (() => {
              const d = docSnap.data() as Omit<ChatMessage, 'id' | 'createdAt'> & {
                createdAt?: { toMillis: () => number };
              };
              return {
                id: docSnap.id,
                senderUid:  d.senderUid,
                senderName: d.senderName,
                senderRole: d.senderRole,
                text:       d.text,
                kind:       d.kind ?? 'text',
                createdAt:  d.createdAt?.toMillis?.() ?? Date.now(),
              };
            })()
          : null;
        setLastMsgs((m) => ({ ...m, [req.id]: msg }));
      });
    });
    return () => unsubs.forEach((u) => u());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests.map((r) => r.id).join(',')]);

  // ابنِ الـ threads مع غير المقروء
  const threads: ChatThread[] = requests.map((req) => {
    const lastMessage    = lastMsgs[req.id] ?? null;
    const lastActivityAt = lastMessage?.createdAt ?? req.createdAt;
    const lastSeen       = myUid ? getLastSeen(myUid, req.id) : 0;
    // غير مقروء فقط إذا كانت آخر رسالة من الطرف الآخر بعد آخر مشاهدة
    const hasUnread =
      !!lastMessage &&
      lastMessage.senderRole !== myRole &&
      lastMessage.createdAt > lastSeen;

    return { request: req, lastMessage, lastActivityAt, hasUnread };
  });

  // ترتيب بالأحدث نشاطاً
  threads.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

  const totalUnread = threads.filter((t) => t.hasUnread).length;

  return { threads, loading, totalUnread };
};
