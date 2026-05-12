// عقد رسائل الـ chat لكل طلب SOS
// مسار التخزين: /sosRequests/{requestId}/messages/{messageId}

import type { UserRole } from './profile';

export type MessageKind = 'text' | 'quick' | 'system';

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  kind: MessageKind;
  createdAt: number;  // Unix ms
}

/** الردود السريعة الجاهزة للطالب — مهمّ لذوي اضطراب التوحد */
export const STUDENT_QUICK_REPLIES: { emoji: string; text: string }[] = [
  { emoji: '💚', text: 'أنا بخير الآن' },
  { emoji: '🆘', text: 'أحتاج مساعدة طبية' },
  { emoji: '😰', text: 'تخوّفت فقط' },
  { emoji: '📍', text: 'موقعي تغيّر' },
  { emoji: '🚶', text: 'أنا في طريقي للملجأ' },
  { emoji: '⏱️', text: 'كم تأخذ المساعدة؟' },
];

/** الردود السريعة للمنسّق */
export const STAFF_QUICK_REPLIES: { emoji: string; text: string }[] = [
  { emoji: '✅', text: 'استلمنا طلبك. المساعدة قادمة.' },
  { emoji: '🏃', text: 'فريق الإسعاف في الطريق.' },
  { emoji: '🛡️', text: 'ابقَ مكانك، أنت بأمان.' },
  { emoji: '🚶', text: 'توجّه لأقرب ملجأ بهدوء.' },
  { emoji: '📞', text: 'سأتواصل معك الآن.' },
  { emoji: '💛', text: 'تنفّس بعمق. كل شيء سيكون بخير.' },
];
