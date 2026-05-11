// مساعد إرسال FCM لعدّة tokens

import { getMessaging, type MulticastMessage } from 'firebase-admin/messaging';

interface Payload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/** يرسل نفس الإشعار لعدّة أجهزة دفعة واحدة */
export const notifyTokens = async (tokens: string[], payload: Payload): Promise<void> => {
  if (tokens.length === 0) return;

  const message: MulticastMessage = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'sanad-emergency',
      },
    },
  };

  const res = await getMessaging().sendEachForMulticast(message);
  console.info(`[notifyTokens] نجح ${res.successCount}/${tokens.length}`);
};
