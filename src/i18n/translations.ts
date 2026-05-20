// قاموس الترجمة — عربي + עברית
// كل مفتاح يأخذ نصّين: ar (عربي) + he (عبري)
// الاستخدام: t('home.title') → "نبض" أو "נבד" حسب اللغة الحاليّة

import type { AppLang } from '../types/profile';

export const translations = {
  // ─── عام ─────────────────────────
  'app.name':              { ar: 'نبض',                  he: 'נבד' },
  'common.save':           { ar: 'حفظ',                  he: 'שמור' },
  'common.cancel':         { ar: 'إلغاء',                he: 'ביטול' },
  'common.edit':           { ar: 'تعديل',                he: 'עריכה' },
  'common.delete':         { ar: 'حذف',                  he: 'מחק' },
  'common.send':           { ar: 'إرسال',                he: 'שלח' },
  'common.confirm':        { ar: 'تأكيد',                he: 'אישור' },
  'common.close':          { ar: 'إغلاق',                he: 'סגור' },
  'common.back':           { ar: 'رجوع',                 he: 'חזרה' },
  'common.loading':        { ar: 'جاري...',              he: 'טוען...' },
  'common.error':          { ar: 'حدث خطأ',              he: 'שגיאה' },
  'common.retry':          { ar: 'حاول مرّة أخرى',       he: 'נסה שוב' },

  // ─── التابات ─────────────────────
  'tab.home':              { ar: 'الرئيسية',             he: 'בית' },
  'tab.map':               { ar: 'الخريطة',              he: 'מפה' },
  'tab.calm':              { ar: 'التهدئة',              he: 'הרגעה' },
  'tab.contact':           { ar: 'التواصل',              he: 'יצירת קשר' },
  'tab.profile':           { ar: 'حسابي',                he: 'הפרופיל' },

  // ─── الصفحة الرئيسية ─────────────
  'home.greeting':         { ar: 'مرحباً',               he: 'שלום' },
  'home.subtitle':         { ar: 'لمسة واحدة لإرسال طلب مساعدة فوري', he: 'לחיצה אחת לשליחת בקשת עזרה מיידית' },
  'home.sos':              { ar: 'نجدة',                 he: 'הצילו' },
  'home.quick.ambulance':  { ar: 'إسعاف',                he: 'אמבולנס' },
  'home.quick.shelter':    { ar: 'ملجأ',                 he: 'מקלט' },
  'home.quick.calm':       { ar: 'تهدئة',                he: 'הרגעה' },
  'home.status.safe':      { ar: 'الموقع آمن',           he: 'אזור בטוח' },
  'home.status.sent':      { ar: 'تم إرسال طلب المساعدة', he: 'בקשת העזרה נשלחה' },
  'home.sos.confirm.title':{ ar: 'تأكيد طلب النجدة',     he: 'אישור בקשת עזרה' },
  'home.sos.confirm.body': { ar: 'سيُرسَل موقعك وبياناتك الطبيّة فوراً', he: 'מיקומך ופרטיך הרפואיים יישלחו מיד' },
  'home.sos.send.now':     { ar: 'إرسال الآن',           he: 'שלח עכשיו' },
  'home.sos.cancel':       { ar: 'إلغاء',                he: 'ביטול' },
  'home.sos.cancel.confirm':{ ar: 'تم إلغاء طلب النجدة • أنت بخير الآن 💚', he: 'בקשת העזרה בוטלה • אתה בסדר עכשיו 💚' },
  'home.notifications':    { ar: 'الإشعارات',            he: 'התראות' },
  'home.chats':            { ar: 'المحادثات',            he: 'שיחות' },
  'home.active.title':     { ar: 'طلب نجدة نشط',         he: 'בקשת עזרה פעילה' },
  'home.options.chat':     { ar: 'فتح المحادثة',         he: 'פתח שיחה' },
  'home.options.calm':     { ar: 'فتح التهدئة',          he: 'פתח הרגעה' },
  'home.options.cancel':   { ar: 'إلغاء طلب النجدة',     he: 'בטל בקשת עזרה' },

  // ─── صفحة التهدئة ─────────────────
  'calm.title':            { ar: 'مركز التهدئة',          he: 'מרכז ההרגעה' },
  'calm.subtitle':         { ar: 'أنت بأمان. تنفس معي.',  he: 'אתה בטוח. נשום איתי.' },
  'calm.tab.breath':       { ar: 'تنفس',                  he: 'נשימה' },
  'calm.tab.messages':     { ar: 'كلمات تهدئة',           he: 'מילים מרגיעות' },
  'calm.tab.sounds':       { ar: 'أصوات',                 he: 'צלילים' },
  'calm.tab.games':        { ar: '🎮 ألعاب',              he: '🎮 משחקים' },
  'calm.breath.start':     { ar: 'ابدأ التنفّس',           he: 'התחל לנשום' },
  'calm.breath.stop':      { ar: 'إيقاف',                he: 'עצור' },
  'calm.breath.ready':     { ar: 'استعد',                he: 'תהיה מוכן' },
  'calm.breath.inhale':    { ar: 'شهيق',                 he: 'שאיפה' },
  'calm.breath.hold':      { ar: 'احبس',                 he: 'החזק' },
  'calm.breath.exhale':    { ar: 'زفير',                 he: 'נשיפה' },
  'calm.game.snake':       { ar: 'لعبة الثعبان',          he: 'משחק נחש' },
  'calm.game.snake.desc':  { ar: 'كلاسيكية ممتعة للتشتيت اللطيف', he: 'משחק קלאסי וכיף להסחת דעת עדינה' },
  'calm.game.memory':      { ar: 'لعبة الذاكرة',          he: 'משחק זיכרון' },
  'calm.game.memory.desc': { ar: 'اعثر على الأزواج المتطابقة', he: 'מצא את הזוגות התואמים' },

  // ─── صفحة التواصل ────────────────
  'contact.title':         { ar: 'التواصل الفوري',        he: 'קשר מיידי' },
  'contact.subtitle':      { ar: 'اتصل بلمسة واحدة',      he: 'התקשר בלחיצה אחת' },
  'contact.fire':          { ar: 'الإطفاء والإنقاذ',      he: 'כיבוי אש והצלה' },
  'contact.fire.desc':     { ar: 'الحرائق والإنقاذ',      he: 'שריפות והצלה' },
  'contact.ambulance':     { ar: 'نجمة داوود الحمراء',    he: 'מגן דוד אדום' },
  'contact.ambulance.desc':{ ar: 'الإسعاف الطبي',         he: 'אמבולנס רפואי' },
  'contact.police':        { ar: 'الشرطة',                he: 'משטרה' },
  'contact.police.desc':   { ar: 'الأمن والنجدة',         he: 'אבטחה וחירום' },
  'contact.civil':         { ar: 'الجبهة الداخلية',       he: 'פיקוד העורף' },
  'contact.civil.desc':    { ar: 'إنذارات الطوارئ المدنية', he: 'התרעות חירום אזרחיות' },
  'contact.dial':          { ar: 'اتصال',                 he: 'חיוג' },
  'contact.calling':       { ar: 'جاري الاتصال بـ',       he: 'מתקשר אל' },
  'contact.voice':         { ar: 'اضغط وتكلم — نبض يستمع', he: 'לחץ ודבר — נבד מקשיב' },
  'contact.voice.listen':  { ar: '🔴 يستمع الآن... قُل "نجدة"', he: '🔴 מקשיב... אמור "הצילו"' },
  'contact.voice.heard':   { ar: '📝 سُمع:',               he: '📝 נשמע:' },
  'contact.voice.unsupported': { ar: '⚠️ متصفّحك لا يدعم التعرّف الصوتي', he: '⚠️ הדפדפן שלך לא תומך בזיהוי קולי' },
  'contact.voice.denied':  { ar: '⚠️ إذن المايكروفون مرفوض — فعّله من إعدادات المتصفّح', he: '⚠️ ההרשאה למיקרופון נדחתה — אפשר אותה בהגדרות הדפדפן' },
  'contact.guardian':      { ar: 'ولي الأمر',             he: 'אפוטרופוס' },
  'contact.guardian.desc': { ar: 'جهة تواصل طارئة',       he: 'איש קשר לחירום' },
  'contact.school':        { ar: 'منسّق الطوارئ المدرسي',  he: 'רכז חירום בית-ספרי' },
  'contact.school.desc':   { ar: 'المدرسة والإرشاد',      he: 'בית הספר וייעוץ' },

  // ─── الخريطة ─────────────────────
  'map.title':             { ar: 'الخريطة',              he: 'מפה' },
  'map.subtitle':          { ar: 'الملاجئ والأماكن الآمنة قريباً منك', he: 'מקלטים ומקומות בטוחים בקרבתך' },
  'map.directions':        { ar: 'الاتجاهات',             he: 'הוראות הגעה' },
  'map.distance.away':     { ar: 'بعيد',                 he: 'מרחק' },

  // ─── الملف الشخصي ────────────────
  'profile.title':         { ar: 'حسابي',                 he: 'הפרופיל שלי' },
  'profile.editing':       { ar: 'جاري...',               he: 'טוען...' },
  'profile.section.personal': { ar: 'المعلومات الشخصية', he: 'מידע אישי' },
  'profile.section.medical':  { ar: 'المعلومات الطبية',  he: 'מידע רפואי' },
  'profile.section.access':   { ar: 'إمكانية الوصول',    he: 'נגישות' },
  'profile.field.name':       { ar: 'الاسم الكامل',      he: 'שם מלא' },
  'profile.field.id':         { ar: 'رقم الهوية',         he: 'תעודת זהות' },
  'profile.field.phone':      { ar: 'رقم الجوال',         he: 'מספר נייד' },
  'profile.field.grade':      { ar: 'الصف الدراسي',       he: 'כיתה' },
  'profile.field.disability': { ar: 'نوع الإعاقة',        he: 'סוג מוגבלות' },
  'profile.field.blood':      { ar: 'فصيلة الدم',         he: 'סוג דם' },
  'profile.field.meds':       { ar: 'الأدوية الدائمة',    he: 'תרופות קבועות' },
  'profile.field.allergies':  { ar: 'الحساسية',          he: 'אלרגיות' },
  'profile.field.guardian':   { ar: 'اسم ولي الأمر',     he: 'שם האפוטרופוס' },
  'profile.field.guardian.phone': { ar: 'رقم ولي الأمر', he: 'מספר אפוטרופוס' },
  'profile.access.voice':     { ar: '🎤 التفعيل الصوتي — قُل "نجدة" لطلب المساعدة', he: '🎤 הפעלה קולית — אמור "הצילו" לבקשת עזרה' },
  'profile.access.notify':    { ar: 'إشعارات الطوارئ',   he: 'התראות חירום' },
  'profile.access.large':     { ar: 'النصوص الكبيرة',    he: 'טקסט גדול' },
  'profile.access.lang':      { ar: 'لغة الواجهة',       he: 'שפת ממשק' },
  'profile.qr':               { ar: 'بطاقة الطوارئ الذكيّة (QR)', he: 'כרטיס חירום חכם (QR)' },
  'profile.qr.desc':          { ar: 'اضغط — يمسحها الممرّض ليرى بياناتك الحيويّة فوراً', he: 'לחץ — האח/ות יסרוק לראות את נתוניך החיוניים מיד' },
  'profile.sms.log':          { ar: 'سجل رسائل SMS الطوارئ', he: 'יומן הודעות SMS חירום' },
  'profile.signout':          { ar: 'تسجيل الخروج',      he: 'התנתקות' },
  'profile.status.safe':      { ar: 'حالة: آمن',          he: 'מצב: בטוח' },
  'profile.saved':            { ar: 'تم حفظ التعديلات',  he: 'השינויים נשמרו' },
  'profile.save.failed':      { ar: 'فشل الحفظ. حاول مرّة أخرى', he: 'השמירה נכשלה. נסה שוב' },

  // ─── تسجيل الدخول ────────────────
  'auth.login.title':      { ar: 'تسجيل الدخول',         he: 'התחברות' },
  'auth.login.subtitle':   { ar: 'سجّل دخولك للوصول لتطبيق نبض', he: 'התחבר כדי להיכנס לאפליקציית נבד' },
  'auth.email':            { ar: 'البريد الإلكتروني',     he: 'דוא"ל' },
  'auth.password':         { ar: 'كلمة المرور',           he: 'סיסמה' },
  'auth.signin':           { ar: 'دخول',                  he: 'כניסה' },
  'auth.signup':           { ar: 'إنشاء حساب',            he: 'הרשמה' },
  'auth.role.student':     { ar: 'طالب',                  he: 'תלמיד' },
  'auth.role.staff':       { ar: 'منسّق طوارئ',           he: 'רכז חירום' },
  'auth.no.account':       { ar: 'ليس لديك حساب؟',        he: 'אין לך חשבון?' },
  'auth.have.account':     { ar: 'لديك حساب بالفعل؟',     he: 'כבר יש לך חשבון?' },

  // ─── lang switcher ───────────────
  'lang.ar':               { ar: 'العربية',               he: 'ערבית' },
  'lang.he':               { ar: 'العبرية',               he: 'עברית' },
} as const;

export type TranslationKey = keyof typeof translations;

/** يُرجع نصّ الترجمة للمفتاح حسب اللغة الحاليّة */
export const translate = (key: TranslationKey, lang: AppLang): string => {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry.ar;
};
