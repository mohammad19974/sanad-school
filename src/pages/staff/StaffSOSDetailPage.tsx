// صفحة تفاصيل طلب SOS — معلومات الطالب + خريطة + chat + أزرار التحكّم

import { useEffect, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { PillButton } from '../../ui/PillButton';
import { StatusBadge } from '../../components/staff/StatusBadge';
import { StudentInfoCard } from '../../components/staff/StudentInfoCard';
import { ChatPanel } from '../../components/staff/ChatPanel';
import { LeafletMap } from '../../components/map/LeafletMap';
import { watchSOSRequest, updateSOSStatus } from '../../api/sosApi';
import { useAuthContext } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import { useToast } from '../../hooks/useToast';
import { colors, fontFamily } from '../../theme/tokens';
import type { SOSRequest, SOSStatus } from '../../types';

type View = 'info' | 'chat';

export const StaffSOSDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const toast = useToast();
  const [req, setReq] = useState<SOSRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('info');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = watchSOSRequest(id, (r) => {
      setReq(r); setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const changeStatus = async (next: SOSStatus, msg: string) => {
    if (!user || !profile) return;
    setBusy(true);
    try {
      await updateSOSStatus(id, next, { uid: user.uid, name: profile.name || 'منسّق' });
      toast.success(msg);
    } catch (err) {
      console.error(err);
      toast.error('فشل تحديث الحالة');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{
            minHeight: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: colors.textMuted, fontFamily,
          }}>جاري التحميل...</div>
        </IonContent>
      </IonPage>
    );
  }

  if (!req) {
    return (
      <IonPage>
        <IonContent>
          <div style={{
            minHeight: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            fontFamily, padding: 20,
          }}>
            <div style={{ fontSize: 48 }}>❓</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
              الطلب غير موجود
            </div>
            <PillButton onClick={() => history.goBack()} variant="outline">رجوع</PillButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const isChatView = view === 'chat';

  return (
    <IonPage>
      <IonContent fullscreen scrollY={!isChatView} style={{ '--background': colors.bg }}>
        <div style={{
          // عند الـ chat نحتاج height ثابت ليبقى الـ footer ثابتاً
          height: isChatView ? '100%' : 'auto',
          minHeight: isChatView ? undefined : '100%',
          display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس — direction:rtl صريح */}
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
              <span style={{ color: colors.primary, fontSize: 22, lineHeight: 1, fontWeight: 700 }}>›</span>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>
                طلب نجدة • {req.studentSnapshot.name || 'طالب'}
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                {formatDateTime(req.createdAt)}
              </div>
            </div>
            <StatusBadge status={req.status} />
          </div>

          {/* تابات */}
          <div style={{
            display: 'flex', padding: '8px 12px',
            background: colors.bgCard, borderBottom: `1px solid ${colors.bgDark}`,
          }}>
            <TabBtn active={view === 'info'} onClick={() => setView('info')}>📋 المعلومات</TabBtn>
            <TabBtn active={view === 'chat'} onClick={() => setView('chat')}>💬 المحادثة</TabBtn>
          </div>

          {/* المحتوى */}
          {view === 'info' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StudentInfoCard student={req.studentSnapshot} />

              {/* الخريطة */}
              <div style={{
                height: 220, borderRadius: 18, overflow: 'hidden',
                border: `2px solid ${colors.primaryLight}50`,
              }}>
                <LeafletMap
                  userLat={req.location.lat}
                  userLng={req.location.lng}
                  shelters={[]}
                />
              </div>

              {/* أزرار التحكّم */}
              <ActionPanel
                status={req.status}
                busy={busy}
                onAcknowledge={() => changeStatus('acknowledged', 'تمّ استلام الطلب')}
                onEnroute={()    => changeStatus('enroute',      'الفريق في الطريق')}
                onResolve={()    => changeStatus('resolved',     'تمّ إنهاء الطلب')}
                onOpenChat={()   => setView('chat')}
              />

              {req.acknowledgedByName && (
                <div style={{
                  fontSize: 11, color: colors.textMuted, textAlign: 'center', padding: 10,
                }}>
                  استلمه: <b style={{ color: colors.primary }}>{req.acknowledgedByName}</b>
                  {req.acknowledgedAt && ` · ${formatDateTime(req.acknowledgedAt)}`}
                </div>
              )}
            </div>
          ) : (
            // chat: flex:1 + minHeight:0 لإبقاء footer ثابتاً
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <ChatPanel requestId={id} myRole="staff" />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

interface ActionProps {
  status: SOSStatus;
  busy: boolean;
  onAcknowledge: () => void;
  onEnroute: () => void;
  onResolve: () => void;
  onOpenChat: () => void;
}
const ActionPanel: FC<ActionProps> = ({ status, busy, onAcknowledge, onEnroute, onResolve, onOpenChat }) => (
  <div style={{
    background: colors.bgCard, borderRadius: 18, padding: 14,
    boxShadow: `0 2px 10px ${colors.cardShadow}`,
    display: 'flex', flexDirection: 'column', gap: 8,
    fontFamily,
  }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, padding: '0 4px' }}>
      إجراءات
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {status === 'pending' && (
        <ActionBtn color={colors.accent} onClick={onAcknowledge} disabled={busy}>
          ✋ استلام
        </ActionBtn>
      )}
      {(status === 'acknowledged') && (
        <ActionBtn color="#2196F3" onClick={onEnroute} disabled={busy}>
          🚑 الفريق قادم
        </ActionBtn>
      )}
      {(status === 'pending' || status === 'acknowledged' || status === 'enroute') && (
        <ActionBtn color={colors.success} onClick={onResolve} disabled={busy}>
          ✅ إنهاء
        </ActionBtn>
      )}
      <ActionBtn color={colors.primary} onClick={onOpenChat}>
        💬 محادثة
      </ActionBtn>
    </div>
  </div>
);

interface ActionBtnProps { color: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; }
const ActionBtn: FC<ActionBtnProps> = ({ color, onClick, disabled, children }) => (
  <button
    onClick={onClick} disabled={disabled}
    style={{
      flex: 1, minWidth: 110,
      padding: '12px 14px', borderRadius: 14,
      background: `${color}15`, color, border: `1.5px solid ${color}40`,
      fontFamily, fontSize: 13, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}
  >{children}</button>
);

interface TabBtnProps { active: boolean; onClick: () => void; children: React.ReactNode; }
const TabBtn: FC<TabBtnProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '8px 6px', borderRadius: 10, border: 'none', cursor: 'pointer',
      background: active ? `${colors.primary}20` : 'transparent',
      color: active ? colors.primary : colors.textMuted,
      fontFamily, fontSize: 13, fontWeight: 700,
    }}
  >{children}</button>
);

const formatDateTime = (ms: number): string =>
  new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  }).format(ms);
