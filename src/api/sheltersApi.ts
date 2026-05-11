// جلب الملاجئ من Firestore + ترتيبها بالقرب من المستخدم

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { haversineMeters } from '../helpers/distance';
import type { Shelter } from '../types';

/** يجلب كل الملاجئ النشطة ويرتّبها بالأقرب */
export const fetchNearbyShelters = async (
  userLat: number,
  userLng: number,
  maxResults = 20,
): Promise<Shelter[]> => {
  const q = query(collection(db, 'shelters'), where('active', '==', true));
  const snap = await getDocs(q);

  const shelters: Shelter[] = snap.docs.map((d) => {
    const data = d.data() as Omit<Shelter, 'id' | 'distanceMeters'>;
    return {
      id: d.id,
      ...data,
      distanceMeters: haversineMeters(userLat, userLng, data.lat, data.lng),
    };
  });

  shelters.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  return shelters.slice(0, maxResults);
};

/** بيانات افتراضية في حال غياب الاتصال أو عدم وجود ملاجئ في القاعدة */
export const fallbackShelters = (lat: number, lng: number): Shelter[] => {
  const base: Omit<Shelter, 'distanceMeters'>[] = [
    { id: 'fb1', name: 'مدرسة الأمل',        type: 'school',  lat: lat + 0.002,  lng: lng + 0.001,  capacity: 200, active: true },
    { id: 'fb2', name: 'مركز الهلال الأحمر', type: 'medical', lat: lat - 0.001,  lng: lng + 0.003,  capacity: 60,  active: true },
    { id: 'fb3', name: 'مسجد النور',         type: 'mosque',  lat: lat + 0.0015, lng: lng - 0.002,  capacity: 150, active: true },
  ];
  return base.map((s) => ({ ...s, distanceMeters: haversineMeters(lat, lng, s.lat, s.lng) }));
};
