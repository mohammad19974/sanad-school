// تنسيق النصوص الشائعة — مضبوط على إسرائيل/القدس (+972)

/** يحوّل رقم الهاتف إلى صيغة دولية E.164 */
export const toE164 = (raw: string, country = 'IL'): string => {
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return `+${digits}`;
  if (country === 'IL') {
    // مثل 0501234567 → +972501234567
    if (digits.startsWith('972')) return `+${digits}`;
    if (digits.startsWith('0'))   return `+972${digits.slice(1)}`;
    return `+972${digits}`;
  }
  if (country === 'SA') {
    if (digits.startsWith('966')) return `+${digits}`;
    if (digits.startsWith('0'))   return `+966${digits.slice(1)}`;
    return `+966${digits}`;
  }
  return `+${digits}`;
};

/** يصيغ رقم الهاتف للعرض: +972 50 123 4567 */
export const formatPhoneDisplay = (e164: string): string => {
  if (e164.startsWith('+972') && e164.length >= 13) {
    return `${e164.slice(0, 4)} ${e164.slice(4, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`;
  }
  if (e164.startsWith('+966') && e164.length >= 13) {
    return `${e164.slice(0, 4)} ${e164.slice(4, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`;
  }
  return e164;
};

/** يصيغ التاريخ من Unix ms إلى ساعة محلية بالعربية */
export const formatTime = (ms: number): string => {
  return new Intl.DateTimeFormat('ar', { hour: '2-digit', minute: '2-digit' }).format(ms);
};
