// رموز التصميم — مصدر واحد للألوان والأبعاد
// كل مكوّن يستورد من هنا فقط، لا hex ثابت في الكود

export const colors = {
  // أساسي — أخضر هادئ يبعث الطمأنينة
  primary:      '#4A7C59',
  primaryDark:  '#2E5138',
  primaryLight: '#7DB88A',

  // إبراز كهرماني
  accent:       '#C8853A',

  // خطر — أحمر فقط لأرقام الطوارئ ولا شيء آخر
  danger:       '#E53935',
  success:      '#4CAF50',
  warning:      '#f5c300',

  // خلفيات
  bg:           '#F5EED8',
  bgDark:       '#E8DCC0',
  bgCard:       '#FDFAF3',
  bgSettings:   '#F0E9D0',
  mapBg:        '#c8e0c8',

  // نصوص
  text:         '#2C3B2E',
  textMuted:    '#7A8C7C',
  textLight:    '#B0BEB2',
  white:        '#ffffff',

  // أخرى
  navBorder:    '#DDD5BC',
  pulse:        'rgba(74,124,89,0.35)',
  cardShadow:   'rgba(74,124,89,0.10)',

  // تدرّجات
  calmGradient: 'linear-gradient(160deg,#2E5138 0%,#7DB88A 100%)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 50,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  bold: 700,
  black: 800,
} as const;

export const fontFamily = "'Tajawal', sans-serif";
