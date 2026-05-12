// طبقة المصادقة — تدعم طريقتين:
// (أ) البريد + كلمة المرور (الافتراضية، تعمل على خطة Spark المجانية)
// (ب) رقم الهاتف + OTP (تحتاج Blaze + reCAPTCHA)
// لا تستورد firebase/auth خارج هذا الملف

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  type ConfirmationResult,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

// ─── البريد + كلمة المرور ─────────────────────────────────

/** إنشاء حساب جديد بالبريد وكلمة المرور */
export const signUpWithEmail = async (
  email: string, password: string, displayName?: string,
): Promise<User> => {
  const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && cred.user) {
    await fbUpdateProfile(cred.user, { displayName });
  }
  return cred.user;
};

/** تسجيل الدخول بحساب موجود */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

// ─── رقم الهاتف + OTP ─────────────────────────────────────

let recaptchaVerifier: RecaptchaVerifier | null = null;

const ensureRecaptcha = (containerId = 'recaptcha-container'): RecaptchaVerifier => {
  if (recaptchaVerifier) return recaptchaVerifier;
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  return recaptchaVerifier;
};

/** يرسل OTP إلى رقم بصيغة E.164، مثل +966512345678 */
export const requestOtp = async (phoneE164: string): Promise<ConfirmationResult> => {
  const verifier = ensureRecaptcha();
  return await signInWithPhoneNumber(auth, phoneE164, verifier);
};

/** يتحقّق من رمز OTP — يُرجع المستخدم بعد النجاح */
export const verifyOtp = async (
  confirmation: ConfirmationResult,
  code: string,
): Promise<User> => {
  const result = await confirmation.confirm(code);
  return result.user;
};

// ─── مشترك ────────────────────────────────────────────────

export const signOut = async (): Promise<void> => {
  await fbSignOut(auth);
};

/** يستمع لتغيّر حالة الدخول. يُرجع دالة إلغاء الاشتراك */
export const watchAuthState = (cb: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, cb);
};

export const getCurrentUser = (): User | null => auth.currentUser;

// ─── تحويل أخطاء Firebase إلى رسائل عربية ─────────────────

export const authErrorMessage = (code: string): string => {
  const map: Record<string, string> = {
    'auth/invalid-email':              'البريد الإلكتروني غير صالح',
    'auth/user-not-found':             'لا يوجد حساب بهذا البريد',
    'auth/wrong-password':             'كلمة المرور غير صحيحة',
    'auth/invalid-credential':         'بيانات الدخول غير صحيحة',
    'auth/email-already-in-use':       'هذا البريد مستخدم بالفعل',
    'auth/weak-password':              'كلمة المرور ضعيفة (6 أحرف على الأقل)',
    'auth/too-many-requests':          'محاولات كثيرة. حاول لاحقاً.',
    'auth/network-request-failed':     'فشل الاتصال بالشبكة',
    'auth/operation-not-allowed':      'هذه الطريقة غير مفعّلة في Firebase Console',
    'auth/billing-not-enabled':        'تسجيل الهاتف يحتاج خطة Blaze',
    'auth/invalid-phone-number':       'رقم الهاتف غير صحيح',
    'auth/invalid-verification-code':  'رمز التحقّق غير صحيح',
  };
  return map[code] || 'حدث خطأ. حاول مرة أخرى.';
};
