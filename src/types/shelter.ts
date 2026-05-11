// عقد بيانات الملجأ — Firestore /shelters/{shelterId}

export type ShelterType = 'school' | 'medical' | 'mosque' | 'shelter';

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
  school:  'مدرسة',
  medical: 'طبي',
  mosque:  'مسجد',
  shelter: 'ملجأ',
};

// أيقونة افتراضية لكل نوع
export const shelterTypeIcon: Record<ShelterType, string> = {
  school:  'shield',
  medical: 'ambulance',
  mosque:  'shield',
  shelter: 'shield',
};
