// مدقّقات بسيطة للحقول

/** يتحقق من صحة رقم هاتف سعودي بصيغة محلية أو دولية */
export const isValidSaudiPhone = (raw: string): boolean => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('966')) return digits.length === 12;
  if (digits.startsWith('05'))  return digits.length === 10;
  if (digits.startsWith('5'))   return digits.length === 9;
  return false;
};

/** رمز OTP عبارة عن 6 أرقام */
export const isValidOtp = (code: string): boolean => /^\d{6}$/.test(code);

/** رقم الهوية السعودية = 10 أرقام */
export const isValidNationalId = (id: string): boolean => /^\d{10}$/.test(id);
