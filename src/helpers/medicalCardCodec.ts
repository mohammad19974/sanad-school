// ترميز/فك ترميز بطاقة الطوارئ الطبية في URL hash
// الفكرة: نضع البيانات في hash (#) بعد الـ base64 url-safe
// hash لا يُرسَل للسيرفر — يظلّ في المتصفّح فقط (خصوصية)

import type { StudentProfile } from '../types';

/** بنية مدمجة للبطاقة — أسماء حقول قصيرة لتقليل حجم QR */
export interface MedicalCardData {
  v: 1;                              // الإصدار
  n: string;                         // الاسم
  b?: string;                        // فصيلة الدم
  a?: string;                        // الحساسية
  m?: string;                        // الأدوية
  d?: string;                        // نوع الإعاقة
  g?: { n: string; p: string };     // ولي الأمر {الاسم، الرقم}
  s?: { n: string; p: string };     // المنسّق المدرسي
  i?: string;                        // آخر 4 أرقام من الهوية (للتحقّق فقط)
  t: number;                         // وقت الإنشاء (Unix ms)
}

/** يحوّل سلسلة عربية إلى base64 url-safe */
const toBase64Url = (s: string): string => {
  // unescape(encodeURIComponent(...)) للتعامل مع UTF-8 (دعم العربية)
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** يفكّ base64 url-safe إلى سلسلة عربية */
const fromBase64Url = (s: string): string => {
  // أعد الحشو + الحروف الأصلية
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return decodeURIComponent(escape(atob(b64)));
};

/** يبني سلسلة QR من ملف الطالب */
export const encodeMedicalCard = (profile: StudentProfile): string => {
  const card: MedicalCardData = {
    v: 1,
    n: profile.name || 'طالب',
    b: profile.blood || undefined,
    a: profile.allergies || undefined,
    m: profile.meds || undefined,
    d: profile.disability || undefined,
    g: profile.guardian?.phone
      ? { n: profile.guardian.name || 'ولي الأمر', p: profile.guardian.phone }
      : undefined,
    s: profile.schoolCoordinator?.phone
      ? { n: profile.schoolCoordinator.name || 'منسّق', p: profile.schoolCoordinator.phone }
      : undefined,
    i: profile.id ? profile.id.slice(-4) : undefined,
    t: Date.now(),
  };
  return toBase64Url(JSON.stringify(card));
};

/** يفكّ سلسلة QR إلى MedicalCardData */
export const decodeMedicalCard = (encoded: string): MedicalCardData | null => {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as MedicalCardData;
    if (parsed.v !== 1 || typeof parsed.n !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
};

/** يبني URL كامل قابل للعرض في QR */
export const buildCardUrl = (encoded: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/medical-card#${encoded}`;
};
