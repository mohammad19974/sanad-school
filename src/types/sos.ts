// عقد طلب النجدة — Firestore /sosRequests/{id}

export type SOSStatus = 'pending' | 'acknowledged' | 'resolved';

export interface SOSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface SOSRequest {
  id: string;
  studentId: string;
  location: SOSLocation;
  status: SOSStatus;
  createdAt: number;
  acknowledgedBy?: string;
  notes?: string;
}

/** نتيجة استدعاء Cloud Function */
export interface SendSOSResult {
  requestId: string;
  guardianNotified: boolean;
}
