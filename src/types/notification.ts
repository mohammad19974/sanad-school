// عقد بيانات الإشعار
export type NotificationKind = 'sos' | 'school' | 'drill' | 'shelter' | 'family' | 'info';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Unix ms */
  createdAt: number;
  read: boolean;
}
