// hook chat كامل لطلب SOS — رسائل + typing + read receipts

import { useCallback, useEffect, useRef, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../api/firebase';
import {
  sendMessage, watchMessages, setTypingState, watchTyping, markChatRead,
  type TypingPresence,
} from '../api/messagesApi';
import { useAuthContext } from '../context/AuthContext';
import { useProfileContext } from '../context/ProfileContext';
import type { ChatMessage, MessageKind } from '../types';

interface Result {
  messages:           ChatMessage[];
  loading:            boolean;
  /** هل الطرف الآخر يكتب الآن */
  othersTyping:       TypingPresence[];
  /** آخر وقت قرأ فيه الطرف الآخر (Unix ms) — للتحقّق من ✓✓ */
  otherLastSeen:      number;
  send:               (text: string, kind?: MessageKind) => Promise<void>;
  /** يستدعى عند تغيير draft ليُعلم الطرف الآخر */
  onTyping:           (isTyping: boolean) => void;
  /** يستدعى عند فتح المحادثة (لتسجيل القراءة) */
  markRead:           () => void;
}

const TYPING_THROTTLE_MS = 2000;
const TYPING_AUTO_CLEAR_MS = 4000;

export const useChat = (requestId: string | undefined): Result => {
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [loading, setLoading]           = useState(true);
  const [othersTyping, setOthersTyping] = useState<TypingPresence[]>([]);
  const [otherLastSeen, setOtherLastSeen] = useState(0);

  const lastTypingWriteRef = useRef(0);
  const autoClearTimerRef  = useRef<number | null>(null);

  // ─── الاشتراك بالرسائل ───────────────────────────
  useEffect(() => {
    if (!requestId) { setLoading(false); return; }
    setLoading(true);
    const unsub = watchMessages(requestId, (m) => {
      setMessages(m);
      setLoading(false);
    });
    return () => unsub();
  }, [requestId]);

  // ─── الاشتراك بـ typing ────────────────────────
  useEffect(() => {
    if (!requestId || !user) return;
    const unsub = watchTyping(requestId, user.uid, setOthersTyping);
    // إعادة فلترة كل ثانية لإسقاط القدامى
    const tick = window.setInterval(() => {
      setOthersTyping((list) => list.filter((t) => Date.now() - t.updatedAt < 5000));
    }, 1000);
    return () => { unsub(); window.clearInterval(tick); };
  }, [requestId, user]);

  // ─── الاشتراك بآخر مشاهدة من الطرف الآخر ─────────
  useEffect(() => {
    if (!requestId || !profile) return;
    const ref = doc(db, 'sosRequests', requestId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      const field = profile.role === 'student' ? 'lastSeenByStaff' : 'lastSeenByStudent';
      const ts = d[field] as { toMillis?: () => number } | undefined;
      setOtherLastSeen(ts?.toMillis?.() ?? 0);
    });
    return () => unsub();
  }, [requestId, profile]);

  // ─── إرسال رسالة ──────────────────────────────
  const send = useCallback(async (text: string, kind: MessageKind = 'text') => {
    if (!requestId || !user || !profile) return;
    const cleaned = text.trim();
    if (!cleaned) return;
    await sendMessage({
      requestId,
      senderUid:  user.uid,
      senderName: profile.name || (profile.role === 'staff' ? 'منسّق' : 'طالب'),
      senderRole: profile.role,
      text:       cleaned,
      kind,
    });
    // إيقاف typing بعد الإرسال
    setTypingState(requestId, user.uid,
      profile.name || (profile.role === 'staff' ? 'منسّق' : 'طالب'),
      profile.role, false).catch(() => {});
    lastTypingWriteRef.current = 0;
    if (autoClearTimerRef.current) {
      window.clearTimeout(autoClearTimerRef.current);
      autoClearTimerRef.current = null;
    }
  }, [requestId, user, profile]);

  // ─── إشعار بالكتابة — throttled ──────────────
  const onTyping = useCallback((isTyping: boolean) => {
    if (!requestId || !user || !profile) return;
    const name = profile.name || (profile.role === 'staff' ? 'منسّق' : 'طالب');

    if (!isTyping) {
      setTypingState(requestId, user.uid, name, profile.role, false).catch(() => {});
      lastTypingWriteRef.current = 0;
      if (autoClearTimerRef.current) {
        window.clearTimeout(autoClearTimerRef.current);
        autoClearTimerRef.current = null;
      }
      return;
    }

    const now = Date.now();
    if (now - lastTypingWriteRef.current >= TYPING_THROTTLE_MS) {
      lastTypingWriteRef.current = now;
      setTypingState(requestId, user.uid, name, profile.role, true).catch(() => {});
    }

    // مؤقّت تلقائي للتصفير لو توقّف عن الكتابة
    if (autoClearTimerRef.current) window.clearTimeout(autoClearTimerRef.current);
    autoClearTimerRef.current = window.setTimeout(() => {
      setTypingState(requestId, user.uid, name, profile.role, false).catch(() => {});
      lastTypingWriteRef.current = 0;
    }, TYPING_AUTO_CLEAR_MS);
  }, [requestId, user, profile]);

  // ─── تسجيل قراءة ──────────────────────────────
  const markRead = useCallback(() => {
    if (!requestId || !profile) return;
    markChatRead(requestId, profile.role).catch(() => {});
  }, [requestId, profile]);

  // علِّم كمقروء عند وصول رسائل جديدة من الطرف الآخر
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (profile && lastMsg.senderRole !== profile.role) {
      markRead();
    }
  }, [messages, profile, markRead]);

  // تنظيف عند فكّ التركيب
  useEffect(() => () => {
    if (autoClearTimerRef.current) window.clearTimeout(autoClearTimerRef.current);
    if (requestId && user && profile) {
      const name = profile.name || (profile.role === 'staff' ? 'منسّق' : 'طالب');
      setTypingState(requestId, user.uid, name, profile.role, false).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages, loading,
    othersTyping, otherLastSeen,
    send, onTyping, markRead,
  };
};
