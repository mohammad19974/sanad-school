// تنسيق النصوص الشائعة

/** يحوّل رقم الهاتف إلى صيغة دولية E.164 */
export const toE164 = (raw: string, country = 'SA'): string => {
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return `+${digits}`;
  if (country === 'SA') {
    // مثل 0512345678 → +966512345678
    if (digits.startsWith('966')) return `+${digits}`;
    if (digits.startsWith('0'))   return `+966${digits.slice(1)}`;
    return `+966${digits}`;
  }
  return `+${digits}`;
};

/** يصيغ رقم الهاتف للعرض: +966 51 234 5678 */
export const formatPhoneDisplay = (e164: string): string => {
  if (!e164.startsWith('+966') || e164.length < 13) return e164;
  return `${e164.slice(0, 4)} ${e164.slice(4, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`;
};

/** يصيغ التاريخ من Unix ms إلى ساعة محلية بالعربية */
export const formatTime = (ms: number): string => {
  return new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(ms);
};
