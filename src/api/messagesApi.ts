// طبقة رسائل الـ chat + حالة "يكتب" + إيصالات القراءة
// المسارات:
//   /sosRequests/{rid}/messages/{mid}    — الرسائل
//   /sosRequests/{rid}/typing/{uid}      — حالة الكتابة
//   /sosRequests/{rid}                   — الحقول lastSeenByXxx

import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp,
  doc, setDoc, deleteDoc, updateDoc, getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ChatMessage, MessageKind, UserRole } from '../types';

// ─── إرسال رسالة ──────────────────────────────────

interface SendArgs {
  requestId: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  kind?: MessageKind;
}

export const sendMessage = async (args: SendArgs): Promise<void> => {
  const colRef = collection(db, 'sosRequests', args.requestId, 'messages');
  await addDoc(colRef, {
    senderUid:  args.senderUid,
    senderName: args.senderName,
    senderRole: args.senderRole,
    text:       args.text,
    kind:       args.kind ?? 'text',
    createdAt:  serverTimestamp(),
  });
};

export const watchMessages = (
  requestId: string,
  cb: (msgs: ChatMessage[]) => void,
): (() => void) => {
  const q = query(
    collection(db, 'sosRequests', requestId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => {
      const data = d.data() as Omit<ChatMessage, 'id' | 'createdAt'> & { createdAt?: { toMillis: () => number } };
      return {
        id: d.id,
        senderUid:  data.senderUid,
        senderName: data.senderName,
        senderRole: data.senderRole,
        text:       data.text,
        kind:       data.kind ?? 'text',
        createdAt:  data.createdAt?.toMillis?.() ?? Date.now(),
      } as ChatMessage;
    });
    cb(msgs);
  });
};

// ─── حالة "يكتب الآن" ──────────────────────────────

export interface TypingPresence {
  uid:       string;
  name:      string;
  role:      UserRole;
  updatedAt: number; // Unix ms (client time)
}

/** يكتب/يُحدّث حالة "يكتب" للمستخدم الحالي — يحذفها لو active=false */
export const setTypingState = async (
  requestId: string,
  uid: string, name: string, role: UserRole,
  active: boolean,
): Promise<void> => {
  const ref = doc(db, 'sosRequests', requestId, 'typing', uid);
  if (!active) {
    try { await deleteDoc(ref); } catch { /* ignore */ }
    return;
  }
  await setDoc(ref, { uid, name, role, updatedAt: Date.now() });
};

/** يستمع لكل حالات "يكتب" — يستبعد الذاتي والقديم >5s */
export const watchTyping = (
  requestId: string,
  myUid: string,
  cb: (others: TypingPresence[]) => void,
): (() => void) => {
  const ref = collection(db, 'sosRequests', requestId, 'typing');
  return onSnapshot(ref, (snap) => {
    const now = Date.now();
    const list: TypingPresence[] = snap.docs
      .map((d) => d.data() as TypingPresence)
      .filter((t) => t.uid !== myUid && now - t.updatedAt < 5000);
    cb(list);
  });
};

// ─── إيصالات القراءة (lastSeen) ────────────────────

/** يُسجّل أنّ الدور المحدّد فتح المحادثة الآن — يُستخدم لحساب ✓✓ */
export const markChatRead = async (
  requestId: string,
  role: UserRole,
): Promise<void> => {
  const ref = doc(db, 'sosRequests', requestId);
  const field = role === 'student' ? 'lastSeenByStudent' : 'lastSeenByStaff';
  try {
    await updateDoc(ref, { [field]: serverTimestamp() });
  } catch (err) {
    console.warn('[markChatRead]', err);
  }
};

// ─── حذف بقايا typing عند فك التركيب ─────────────────

export const clearAllMyTyping = async (
  requestId: string, uid: string,
): Promise<void> => {
  try {
    const q = await getDocs(collection(db, 'sosRequests', requestId, 'typing'));
    await Promise.all(
      q.docs.filter((d) => d.id === uid).map((d) => deleteDoc(d.ref)),
    );
  } catch { /* ignore */ }
};
