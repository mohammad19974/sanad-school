// عقد بيانات الملجأ — Firestore /shelters/{shelterId}

export type ShelterType =
  | 'school'
  | 'medical'
  | 'mosque'
  | 'shelter'
  | 'police'
  | 'firestation';

export interface Shelter {
  id: string;
  name: string;
  type: ShelterType;
  lat: number;
  lng: number;
  capacity: number;
  active: boolean;
  /** المسافة من المستخدم بالأمتار — تُحسب في العميل */
  distanceMeters?: number;
}

// تحويل نوع الملجأ إلى تسمية عربية
export const shelterTypeLabel: Record<ShelterType, string> = {
  school:      'مدرسة',
  medical:     'مستشفى',
  mosque:      'مسجد',
  shelter:     'ملجأ',
  police:      'شرطة',
  firestation: 'دفاع مدني',
};

// أيقونة لكل نوع (من Icon.tsx)
export const shelterTypeIcon: Record<ShelterType, string> = {
  school:      'shield',
  medical:     'ambulance',
  mosque:      'shield',
  shelter:     'shield',
  police:      'police',
  firestation: 'fire',
};

// لون مميّز لكل فئة (يستخدم على markers الخريطة + chips القائمة)
export const shelterTypeColor: Record<ShelterType, string> = {
  school:      '#4A7C59', // أخضر primary
  medical:     '#E53935', // أحمر
  mosque:      '#7B6FAD', // بنفسجي
  shelter:     '#C8853A', // كهرماني
  police:      '#1565C0', // أزرق
  firestation: '#FF7043', // برتقالي
};
