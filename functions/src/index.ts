// نقطة دخول Cloud Functions — تصدير دوال callable

import { initializeApp } from 'firebase-admin/app';
initializeApp();

export { sendSOS } from './sos';
