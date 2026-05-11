// تحويل الأرقام بين العربية الهندية (٠-٩) والإنجليزية (0-9)

const arabicDigits   = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishDigits  = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** 123 → ١٢٣ */
export const toArabicNumber = (input: string | number): string => {
  return String(input).replace(/\d/g, (d) => arabicDigits[Number(d)]);
};

/** ١٢٣ → 123 */
export const toEnglishNumber = (input: string): string => {
  return input.replace(/[٠-٩]/g, (d) => englishDigits[arabicDigits.indexOf(d)]);
};
