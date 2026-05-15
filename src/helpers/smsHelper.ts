// مساعد إرسال SMS عبر شريحة الاتصال — يعمل offline (لا يحتاج إنترنت)
// يستخدم sms: URL scheme — مدعوم على Android Chrome + iOS Safari + Capacitor

import type { StudentProfile } from '../types';
import type { Coords } from '../hooks/useGeolocation';

/** يبني نصّ رسالة طوارئ مختصرة (يحاول البقاء ضمن 160 حرف) */
export const buildSosSmsBody = (profile: StudentProfile, coords?: Coords | null): string => {
  const parts: string[] = [];
  parts.push(`🆘 طلب نجدة من ${profile.name || 'طالب'}`);

  if (coords) {
    const lat = coords.lat.toFixed(5);
    const lng = coords.lng.toFixed(5);
    parts.push(`الموقع: https://maps.google.com/?q=${lat},${lng}`);
  }

  const medParts: string[] = [];
  if (profile.blood)     medParts.push(`فصيلة: ${profile.blood}`);
  if (profile.allergies) medParts.push(`حساسية: ${profile.allergies}`);
  if (profile.meds)      medParts.push(`أدوية: ${profile.meds}`);
  if (medParts.length) parts.push(medParts.join(' • '));

  return parts.join('\n');
};

/** يفتح تطبيق الرسائل في الجهاز مع تعبئة الرقم والنصّ */
export const openSmsCompose = (phone: string, body: string): void => {
  // إزالة أيّ مسافات/شرطات من الرقم
  const cleaned = phone.replace(/\s|-/g, '');
  const encoded = encodeURIComponent(body);
  // sms:NUM?body=TEXT يعمل على Android + iOS الحديث
  const href = `sms:${cleaned}?body=${encoded}`;
  // window.location.href يفتح في نفس النافذة — يطلق Intent النظام
  window.location.href = href;
};

/** يحدّد أرقام الطوارئ المرشّحة بالترتيب — أوّل رقم متاح يُستخدم */
export interface SmsRecipient {
  name: string;
  phone: string;
  role: 'guardian' | 'coordinator' | 'civilDefense';
}

export const pickSmsRecipients = (profile: StudentProfile | null): SmsRecipient[] => {
  const list: SmsRecipient[] = [];
  if (profile?.guardian?.phone) {
    list.push({
      name: profile.guardian.name || 'ولي الأمر',
      phone: profile.guardian.phone,
      role: 'guardian',
    });
  }
  if (profile?.schoolCoordinator?.phone) {
    list.push({
      name: profile.schoolCoordinator.name || 'منسّق المدرسة',
      phone: profile.schoolCoordinator.phone,
      role: 'coordinator',
    });
  }
  // أرقام الطوارئ الرسميّة (100/101/102/104) لا تستقبل SMS عادةً — لا نضيفها افتراضياً
  return list;
};
