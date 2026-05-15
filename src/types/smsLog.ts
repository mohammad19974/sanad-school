// عقد سجل رسائل SMS الطوارئ (محلي — localStorage)

export interface SmsLogEntry {
  id:        string;        // uuid محلّي
  recipientName: string;
  recipientPhone: string;
  body:      string;
  reason:    'offline' | 'manual';
  createdAt: number;        // Unix ms
  location?: { lat: number; lng: number };
}
