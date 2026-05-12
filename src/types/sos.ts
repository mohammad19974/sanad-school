// عقد طلب النجدة — Firestore /sosRequests/{id}

import type { BloodType, DisabilityType } from './profile';

export type SOSStatus = 'pending' | 'acknowledged' | 'enroute' | 'resolved' | 'cancelled';

export interface SOSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

/** لقطة من بيانات الطالب وقت إرسال الطلب — للوصول السريع من dashboard
 *  القيم null مقصودة لأن Firestore لا يدعم undefined */
export interface StudentSnapshot {
  uid: string;
  name: string;
  phone?: string | null;
  blood?: BloodType | '' | null;
  disability?: DisabilityType | '' | null;
  meds?: string | null;
  allergies?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export interface SOSRequest {
  id: string;
  studentId: string;
  studentSnapshot: StudentSnapshot;
  location: SOSLocation;
  status: SOSStatus;
  createdAt: number;
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: number;
  resolvedAt?: number;
  /** عدد الرسائل (يُحدَّث تلقائياً عبر counter) — اختياري */
  unreadForStudent?: number;
  unreadForStaff?: number;
}

export const statusLabel: Record<SOSStatus, string> = {
  pending:      'في الانتظار',
  acknowledged: 'تمّ الاستلام',
  enroute:      'الفريق قادم',
  resolved:     'تمّ الحلّ',
  cancelled:    'مُلغى',
};

export const statusColor: Record<SOSStatus, string> = {
  pending:      '#E53935',
  acknowledged: '#FF9800',
  enroute:      '#2196F3',
  resolved:     '#4CAF50',
  cancelled:    '#9E9E9E',
};

/** نتيجة استدعاء Cloud Function */
export interface SendSOSResult {
  requestId: string;
  guardianNotified: boolean;
}
