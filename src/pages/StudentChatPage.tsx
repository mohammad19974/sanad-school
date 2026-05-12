// صفحة المحادثة للطالب — لطلب SOS نشط

import { useEffect, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { StatusBadge } from '../components/staff/StatusBadge';
import { ChatPanel } from '../components/staff/ChatPanel';
import { watchSOSRequest } from '../api/sosApi';
import { useAuthContext } from '../context/AuthContext';
import { setLastSeen } from '../hooks/useChatThreads';
import { colors, fontFamily } from '../theme/tokens';
import type { SOSRequest } from '../types';

export const StudentChatPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuthContext();
  const [req, setReq] = useState<SOSRequest | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = watchSOSRequest(id, setReq);
    if (user) setLastSeen(user.uid, id);
    return () => unsub();
  }, [id, user]);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} style={{ '--background': colors.bg }}>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس — direction:rtl صريح لضمان ترتيب صحيح */}
          <div style={{
            padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: `1px solid ${colors.bgDark}`, background: colors.bgCard,
            direction: 'rtl',
          }}>
            <button
              onClick={() => history.goBack()}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${colors.primary}18`, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* في RTL: سهم البَعد الخلفي يشير لليمين */}
              <span style={{ color: colors.primary, fontSize: 22, lineHeight: 1, fontWeight: 700 }}>›</span>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>
                محادثة مع المنسّق
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                {req?.acknowledgedByName ? `استلمه ${req.acknowledgedByName}` : 'في انتظار الاستجابة'}
              </div>
            </div>
            {req && <StatusBadge status={req.status} />}
          </div>

          {/* لوحة الـ chat — flex:1 + minHeight:0 ضروري */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ChatPanel requestId={id} myRole="student" />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
