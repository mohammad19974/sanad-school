// hook محادثات للطالب — يعرض طلباته فقط (ليس كل الطلاب)
// يشترك بآخر رسالة لكل طلب لحساب unread

import { useEffect, useState } from 'react';
import {
  collection, limit, onSnapshot, orderBy, query,
} from 'firebase/firestore';
import { db } from '../api/firebase';
import { watchStudentSOSRequests } from '../api/sosApi';
import {
  getLastSeen, type ChatThread,
} from './useChatThreads';
import { useAuthContext } from '../context/AuthContext';
import type { ChatMessage, SOSRequest } from '../types';

interface Result {
  threads: ChatThread[];
  loading: boolean;
  totalUnread: number;
  /** أحدث طلب نشط — للوصول السريع من الـ Home */
  activeThread: ChatThread | null;
}

export const useStudentChatThreads = (): Result => {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [lastMsgs, setLastMsgs] = useState<Record<string, ChatMessage | null>>({});
  const [loading, setLoading]   = useState(true);

  // اشترك في طلبات SOS للطالب الحالي
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const unsub = watchStudentSOSRequests(user.uid, (list) => {
      setRequests(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // لكل طلب: اشترك في آخر رسالة
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

  const threads: ChatThread[] = requests.map((req) => {
    const lastMessage    = lastMsgs[req.id] ?? null;
    const lastActivityAt = lastMessage?.createdAt ?? req.createdAt;
    const lastSeen       = user ? getLastSeen(user.uid, req.id) : 0;
    // غير مقروء = آخر رسالة من المنسّق + بعد آخر مشاهدة
    const hasUnread =
      !!lastMessage &&
      lastMessage.senderRole === 'staff' &&
      lastMessage.createdAt > lastSeen;
    return { request: req, lastMessage, lastActivityAt, hasUnread };
  });

  threads.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

  const totalUnread = threads.filter((t) => t.hasUnread).length;
  const activeThread = threads.find((t) =>
    t.request.status === 'pending'
    || t.request.status === 'acknowledged'
    || t.request.status === 'enroute',
  ) ?? null;

  return { threads, loading, totalUnread, activeThread };
};
