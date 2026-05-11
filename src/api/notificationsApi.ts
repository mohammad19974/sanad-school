// تسجيل token FCM في ملف الطالب — تستخدمه السحابة لإرسال إشعارات

import { doc, arrayUnion, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/** يضيف رمز جهاز جديد لملف الطالب (idempotent) */
export const registerFCMToken = async (uid: string, token: string): Promise<void> => {
  const ref = doc(db, 'students', uid);
  await updateDoc(ref, { fcmTokens: arrayUnion(token) });
};
