// إدارة ملف الطالب — قراءة/كتابة من Firestore
// كل التحديثات تستخدم setDoc merge لتعمل سواء كان المستند موجوداً أم لا

import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { emptyProfile, type StudentProfile } from '../types';

const studentsCol = 'students';

/** يجلب ملف الطالب — يُنشئ ملفاً فارغاً إذا لم يكن موجوداً */
export const getOrCreateProfile = async (uid: string): Promise<StudentProfile> => {
  const ref = doc(db, studentsCol, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { ...emptyProfile(uid), ...snap.data() } as StudentProfile;
  }
  const fresh = emptyProfile(uid);
  await setDoc(ref, {
    ...fresh,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return fresh;
};

/** يحدّث حقولاً جزئياً من الملف — يُنشئ المستند إن لم يكن موجوداً (merge) */
export const updateProfile = async (
  uid: string,
  patch: Partial<StudentProfile>,
): Promise<void> => {
  const ref = doc(db, studentsCol, uid);
  await setDoc(
    ref,
    { ...patch, uid, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

/** يشترك في تغيّرات الملف لحظياً */
export const watchProfile = (
  uid: string,
  cb: (profile: StudentProfile | null) => void,
): (() => void) => {
  const ref = doc(db, studentsCol, uid);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? ({ ...emptyProfile(uid), ...snap.data() } as StudentProfile) : null);
  });
};
