// سكربت لإدراج ملاجئ تجريبية في Firestore — يستخدم مع Emulator أو مشروع حقيقي
// التشغيل:  ts-node scripts/seed-shelters.ts

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

interface Seed {
  name: string;
  type: 'school' | 'medical' | 'mosque' | 'shelter';
  lat: number;
  lng: number;
  capacity: number;
}

// نقطة مرجعية وسط الرياض
const BASE = { lat: 24.7136, lng: 46.6753 };

const shelters: Seed[] = [
  { name: 'مدرسة الأمل',            type: 'school',  lat: BASE.lat + 0.002,  lng: BASE.lng + 0.001,  capacity: 250 },
  { name: 'مركز الهلال الأحمر',     type: 'medical', lat: BASE.lat - 0.001,  lng: BASE.lng + 0.003,  capacity: 80  },
  { name: 'مسجد النور',              type: 'mosque',  lat: BASE.lat + 0.0015, lng: BASE.lng - 0.002,  capacity: 200 },
  { name: 'مدرسة الفيصلية الثانوية', type: 'school',  lat: BASE.lat + 0.004,  lng: BASE.lng + 0.005,  capacity: 400 },
  { name: 'مستشفى الملك فهد',        type: 'medical', lat: BASE.lat - 0.003,  lng: BASE.lng - 0.002,  capacity: 1000 },
];

const run = async () => {
  for (const s of shelters) {
    await db.collection('shelters').add({
      name: s.name,
      type: s.type,
      lat: s.lat,
      lng: s.lng,
      capacity: s.capacity,
      active: true,
      location: new GeoPoint(s.lat, s.lng),
    });
    console.log('✅ أُدرج:', s.name);
  }
  console.log('— انتهى —');
};

run().catch((e) => { console.error(e); process.exit(1); });
