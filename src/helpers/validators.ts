// مدقّقات بسيطة للحقول — مضبوطة على إسرائيل/القدس

/** يتحقق من صحة رقم هاتف إسرائيلي بصيغة محلية أو دولية */
export const isValidIsraeliPhone = (raw: string): boolean => {
  const digits = raw.replace(/\D/g, '');
  // 972501234567 (12 رقم مع كود الدولة)
  if (digits.startsWith('972')) return digits.length === 12;
  // 0501234567 (10 أرقام مع 0 محلّي)
  if (digits.startsWith('05'))  return digits.length === 10;
  // 0212345678 (الأرضي) أو 03/04/08/09 — 9 أرقام
  if (digits.startsWith('0'))   return digits.length === 9 || digits.length === 10;
  // 501234567 (9 أرقام بدون 0)
  if (digits.startsWith('5'))   return digits.length === 9;
  return false;
};

/** alias قديم — يبقى لتفادي كسر أيّ استدعاء قائم */
export const isValidSaudiPhone = isValidIsraeliPhone;

/** رمز OTP عبارة عن 6 أرقام */
export const isValidOtp = (code: string): boolean => /^\d{6}$/.test(code);

/** رقم الهوية الإسرائيلية = 9 أرقام (تيؤدات زيهوت) */
export const isValidNationalId = (id: string): boolean => /^\d{9}$/.test(id);
