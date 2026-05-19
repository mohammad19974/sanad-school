// عقد بيانات الطالب — يطابق بنية Firestore /students/{uid}

export type UserRole = 'student' | 'staff';

export const roleLabel: Record<UserRole, string> = {
  student: 'طالب',
  staff:   'منسّق طوارئ',
};

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
  role: UserRole;
  name: string;
  id: string;                // رقم الهوية
  phone: string;
  email?: string;
  grade: GradeLevel | '';
  disability: DisabilityType | '';
  blood: BloodType | '';
  meds: string;              // الأدوية الدائمة
  allergies: string;
  guardian: Contact;
  schoolCoordinator: Contact;
  settings: AccessibilitySettings;
  fcmTokens?: string[];
  /** خاص بالمنسّق */
  staffTitle?: string;       // مثل: "منسّق طوارئ — القمة الثانوية"
  createdAt?: number;
  updatedAt?: number;
}

/** يبني لقطة StudentSnapshot من ملف الطالب — تُحفَظ في وثيقة SOS */
export const buildSnapshot = (p: StudentProfile) => ({
  uid:           p.uid,
  name:          p.name || 'طالب',
  phone:         p.phone || null,
  blood:         p.blood || null,
  disability:    p.disability || null,
  meds:          p.meds || null,
  allergies:     p.allergies || null,
  guardianName:  p.guardian?.name  || null,
  guardianPhone: p.guardian?.phone || null,
});

// قيمة افتراضية لإنشاء ملف جديد
export const emptyProfile = (uid: string, role: UserRole = 'student'): StudentProfile => ({
  uid,
  role,
  name: '',
  id: '',
  phone: '',
  email: '',
  grade: '',
  disability: '',
  blood: '',
  meds: '',
  allergies: '',
  guardian: { name: '', phone: '' },
  schoolCoordinator: { name: '', phone: '' },
  settings: { voiceInput: true, notify: true, largeText: false },
  staffTitle: '',
});
