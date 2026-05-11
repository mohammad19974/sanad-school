// طبقة المصادقة — رقم الهاتف + OTP عبر Firebase
// لا تستورد firebase/auth خارج هذا الملف

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as fbSignOut,
  onAuthStateChanged,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;

/** يهيّئ reCAPTCHA الغير مرئي مرة واحدة فقط */
const ensureRecaptcha = (containerId = 'recaptcha-container'): RecaptchaVerifier => {
  if (recaptchaVerifier) return recaptchaVerifier;
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
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

export const signOut = async (): Promise<void> => {
  await fbSignOut(auth);
};

/** يستمع لتغيّر حالة الدخول. يُرجع دالة إلغاء الاشتراك */
export const watchAuthState = (cb: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, cb);
};

export const getCurrentUser = (): User | null => auth.currentUser;
