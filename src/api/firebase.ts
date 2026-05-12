// تهيئة Firebase — الملف الوحيد الذي يستدعي initializeApp
// كل الخدمات الأخرى تستورد من هنا
// مع تفعيل offline persistence لـ Firestore (IndexedDB) — يدعم العمل بدون إنترنت

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);

// Firestore مع offline persistence (IndexedDB) — يعمل عبر tabs متعدّدة
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
  // eslint-disable-next-line no-console
  console.info('[sanad] Firestore offline persistence مُفعَّل');
} catch (err) {
  console.warn('[sanad] فشل تفعيل offline persistence — استخدام cache عادي:', err);
  // fallback لو IndexedDB غير مدعوم (مثل Safari incognito)
  // عند الفشل، الـ Firestore افتراضي يعمل بـ memory cache
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  firestoreDb = initializeFirestore(app, {});
}
export const db: Firestore = firestoreDb;

export const functions: Functions = getFunctions(app, 'us-central1');
export const storage: FirebaseStorage = getStorage(app);

// تشغيل المحاكي محلياً (Firebase Emulators)
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';
if (useEmulators && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    // eslint-disable-next-line no-console
    console.info('[sanad] Firebase emulators متصلة');
  } catch (err) {
    console.warn('[sanad] فشل الاتصال بالمحاكي:', err);
  }
}

export default app;
