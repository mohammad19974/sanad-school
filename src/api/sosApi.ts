// إرسال طلب النجدة — ينادي Cloud Function callable

import { httpsCallable } from 'firebase/functions';
import { onSnapshot, doc } from 'firebase/firestore';
import { functions, db } from './firebase';
import type { SOSLocation, SOSRequest, SendSOSResult } from '../types';

/** ينادي وظيفة sendSOS على الـ backend ويُرجع id الطلب */
export const sendSOS = async (location: SOSLocation): Promise<SendSOSResult> => {
  const fn = httpsCallable<{ location: SOSLocation }, SendSOSResult>(functions, 'sendSOS');
  const res = await fn({ location });
  return res.data;
};

/** يشترك في حالة طلب نجدة معيّن */
export const watchSOSRequest = (
  requestId: string,
  cb: (req: SOSRequest | null) => void,
): (() => void) => {
  const ref = doc(db, 'sosRequests', requestId);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as SOSRequest) : null);
  });
};
