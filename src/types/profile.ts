// عقد بيانات الطالب — يطابق بنية Firestore /students/{uid}

export type GradeLevel = 'الصف العاشر' | 'الصف الحادي عشر' | 'الصف الثاني عشر';

export type DisabilityType = 'اضطراب طيف التوحد' | 'إعاقة حركية' | 'كلاهما';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export interface Contact {
  name: string;
  phone: string;
}

export interface AccessibilitySettings {
  voiceInput: boolean;
  notify: boolean;
  largeText: boolean;
}

export interface StudentProfile {
  uid: string;
  name: string;
  id: string;                // رقم الهوية
  phone: string;
  grade: GradeLevel | '';
  disability: DisabilityType | '';
  blood: BloodType | '';
  meds: string;              // الأدوية الدائمة
  allergies: string;
  guardian: Contact;
  schoolCoordinator: Contact;
  settings: AccessibilitySettings;
  fcmTokens?: string[];
  createdAt?: number;        // Unix ms
  updatedAt?: number;
}

// قيمة افتراضية لإنشاء ملف جديد
export const emptyProfile = (uid: string): StudentProfile => ({
  uid,
  name: '',
  id: '',
  phone: '',
  grade: '',
  disability: '',
  blood: '',
  meds: '',
  allergies: '',
  guardian: { name: '', phone: '' },
  schoolCoordinator: { name: '', phone: '' },
  settings: { voiceInput: true, notify: true, largeText: false },
});
