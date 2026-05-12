// Cloud Function: sendSOS
// يستقبل موقع الطالب، يلتقط لقطة من بياناته، ينشئ مستند الطلب، ويُشعِر ولي الأمر
// اللقطة (studentSnapshot) تُتيح للمنسّق رؤية بيانات الطالب بدون استعلام إضافي

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, GeoPoint } from 'firebase-admin/firestore';
import { notifyTokens } from './notifications';

interface SOSPayload {
  location: { lat: number; lng: number; accuracy?: number };
}

interface SOSResult {
  requestId: string;
  guardianNotified: boolean;
}

export const sendSOS = onCall<SOSPayload, Promise<SOSResult>>(
  { region: 'us-central1' },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول');

    const { location } = request.data ?? {};
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      throw new HttpsError('invalid-argument', 'الموقع غير صالح');
    }

    const db = getFirestore();

    // ─── جلب ملف الطالب أوّلاً للحصول على snapshot ─
    const studentRef = db.collection('students').doc(uid);
    const studentSnap = await studentRef.get();
    const sd = studentSnap.exists ? studentSnap.data() ?? {} : {};

    const studentSnapshot = {
      uid,
      name:           sd.name          ?? 'طالب',
      phone:          sd.phone         ?? null,
      blood:          sd.blood         ?? null,
      disability:     sd.disability    ?? null,
      meds:           sd.meds          ?? null,
      allergies:      sd.allergies     ?? null,
      guardianName:   sd.guardian?.name  ?? null,
      guardianPhone:  sd.guardian?.phone ?? null,
    };

    // ─── إنشاء مستند الطلب ──────────────────────
    const docRef = await db.collection('sosRequests').add({
      studentId:       uid,
      studentSnapshot,
      location:        new GeoPoint(location.lat, location.lng),
      lat:             location.lat,
      lng:             location.lng,
      accuracy:        location.accuracy ?? null,
      status:          'pending',
      createdAt:       FieldValue.serverTimestamp(),
    });

    // ─── إشعار ولي الأمر + كل المنسّقين ─────────
    let guardianNotified = false;
    try {
      const tokens: string[] = Array.isArray(sd.fcmTokens) ? sd.fcmTokens : [];

      // أرسل أيضاً للمنسّقين (المستخدمين بدور 'staff')
      const staffSnap = await db.collection('students').where('role', '==', 'staff').get();
      const staffTokens: string[] = [];
      staffSnap.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.fcmTokens)) staffTokens.push(...data.fcmTokens);
      });

      const allTokens = [...tokens, ...staffTokens];

      if (allTokens.length > 0) {
        await notifyTokens(allTokens, {
          title: '🚨 طلب نجدة من ' + (studentSnapshot.name || 'طالب'),
          body:  `الموقع: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
          data: {
            requestId: docRef.id,
            studentId: uid,
            lat: String(location.lat),
            lng: String(location.lng),
          },
        });
        guardianNotified = true;
      }
    } catch (err) {
      console.error('[sendSOS] فشل إرسال FCM:', err);
    }

    return { requestId: docRef.id, guardianNotified };
  },
);
