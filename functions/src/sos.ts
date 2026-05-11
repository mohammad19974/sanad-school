// Cloud Function: sendSOS
// يستقبل موقع الطالب، ينشئ مستند طلب نجدة، ويُرسل إشعاراً لولي الأمر

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
    if (!uid) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول');
    }

    const { location } = request.data ?? {};
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      throw new HttpsError('invalid-argument', 'الموقع غير صالح');
    }

    const db = getFirestore();

    // 1) إنشاء مستند الطلب
    const docRef = await db.collection('sosRequests').add({
      studentId: uid,
      location: new GeoPoint(location.lat, location.lng),
      accuracy: location.accuracy ?? null,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    // 2) إشعار ولي الأمر — يحتاج fcmTokens مخزّنة في ملف الطالب
    let guardianNotified = false;
    try {
      const studentSnap = await db.collection('students').doc(uid).get();
      const data = studentSnap.data();
      const tokens: string[] = Array.isArray(data?.fcmTokens) ? data!.fcmTokens : [];
      const studentName: string = data?.name ?? 'طالب';

      if (tokens.length > 0) {
        await notifyTokens(tokens, {
          title: '🚨 طلب نجدة من ' + studentName,
          body: `الموقع: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
          data: {
            requestId: docRef.id,
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
