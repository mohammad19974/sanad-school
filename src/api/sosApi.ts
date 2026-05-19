// إرسال طلب النجدة + متابعته (وضع مجاني بدون Cloud Function)
// الطالب يكتب وثيقة الطلب مباشرة في Firestore — مع لقطة من بياناته
// قواعد Firestore تتحقّق من ملكية الطلب والأمان

import {
  onSnapshot, doc, collection, query, orderBy, updateDoc, serverTimestamp,
  where, limit, getDocs, addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  SOSLocation, SOSRequest, SOSStatus, StudentSnapshot,
} from '../types';

const COL = 'sosRequests';

interface SendArgs {
  snapshot: StudentSnapshot;
  location: SOSLocation;
}

interface SendResult {
  requestId: string;
}

/** ينشئ طلب SOS مباشرة في Firestore (لا حاجة لـ Cloud Function) */
export const sendSOS = async ({ snapshot, location }: SendArgs): Promise<SendResult> => {
  const docRef = await addDoc(collection(db, COL), {
    studentId:       snapshot.uid,
    studentSnapshot: snapshot,
    location,
    lat:             location.lat,
    lng:             location.lng,
    accuracy:        location.accuracy ?? null,
    status:          'pending' as SOSStatus,
    createdAt:       serverTimestamp(),
  });
  return { requestId: docRef.id };
};

/** يحوّل وثيقة Firestore إلى SOSRequest */
const docToSOS = (id: string, data: Record<string, unknown>): SOSRequest => {
  const created = data.createdAt as { toMillis?: () => number } | undefined;
  const ack     = data.acknowledgedAt as { toMillis?: () => number } | undefined;
  const res     = data.resolvedAt as { toMillis?: () => number } | undefined;
  return {
    id,
    studentId:          data.studentId as string,
    studentSnapshot:    (data.studentSnapshot ?? { uid: data.studentId, name: '' }) as SOSRequest['studentSnapshot'],
    location:           data.location as SOSLocation,
    status:             (data.status as SOSStatus) ?? 'pending',
    createdAt:          created?.toMillis?.() ?? Date.now(),
    acknowledgedBy:     data.acknowledgedBy as string | undefined,
    acknowledgedByName: data.acknowledgedByName as string | undefined,
    acknowledgedAt:     ack?.toMillis?.(),
    resolvedAt:         res?.toMillis?.(),
  };
};

/** يشترك في طلب SOS معيّن (طالب أو منسّق) */
export const watchSOSRequest = (
  requestId: string,
  cb: (req: SOSRequest | null) => void,
): (() => void) => {
  const ref = doc(db, COL, requestId);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? docToSOS(snap.id, snap.data()) : null);
  });
};

/** يشترك في كل طلبات SOS (للمنسّق) — يرتّبها بالأحدث */
export const watchAllSOSRequests = (
  cb: (list: SOSRequest[]) => void,
): (() => void) => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => docToSOS(d.id, d.data())));
  });
};

/** يشترك في طلبات SOS لطالب معيّن */
export const watchStudentSOSRequests = (
  studentId: string,
  cb: (list: SOSRequest[]) => void,
): (() => void) => {
  const q = query(
    collection(db, COL),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc'),
    limit(20),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => docToSOS(d.id, d.data())));
  });
};

/** يجلب آخر طلب SOS نشط للطالب */
export const fetchLatestActiveSOS = async (studentId: string): Promise<SOSRequest | null> => {
  const q = query(
    collection(db, COL),
    where('studentId', '==', studentId),
    where('status', 'in', ['pending', 'acknowledged', 'enroute']),
    orderBy('createdAt', 'desc'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToSOS(d.id, d.data());
};

/** الطالب يُلغي طلبه الخاص — مسموح حسب قواعد Firestore */
export const cancelMySOS = async (requestId: string): Promise<void> => {
  const ref = doc(db, COL, requestId);
  await updateDoc(ref, {
    status: 'cancelled',
    resolvedAt: serverTimestamp(),
  });
};

/** المنسّق يُغيّر حالة الطلب */
export const updateSOSStatus = async (
  requestId: string,
  status: SOSStatus,
  staff: { uid: string; name: string },
): Promise<void> => {
  const ref = doc(db, COL, requestId);
  const patch: Record<string, unknown> = { status };
  if (status === 'acknowledged') {
    patch.acknowledgedBy     = staff.uid;
    patch.acknowledgedByName = staff.name;
    patch.acknowledgedAt     = serverTimestamp();
  }
  if (status === 'resolved') {
    patch.resolvedAt = serverTimestamp();
  }
  await updateDoc(ref, patch);
};
