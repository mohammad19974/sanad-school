// الصفحة الرئيسية — زر النجدة + الإجراءات السريعة

import { useEffect, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { SOSButton } from '../components/home/SOSButton';
import { SOSConfirmModal } from '../components/home/SOSConfirmModal';
import { StatusBanner } from '../components/home/StatusBanner';
import { QuickActions } from '../components/home/QuickActions';
import { NotificationsPanel } from '../components/home/NotificationsPanel';
import { ActiveSOSBanner } from '../components/home/ActiveSOSBanner';
import { Icon } from '../ui/Icon';
import { useAuthContext } from '../context/AuthContext';
import { useProfileContext } from '../context/ProfileContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNotifications } from '../hooks/useNotifications';
import { useStudentChatThreads } from '../hooks/useStudentChatThreads';
import { useToast } from '../hooks/useToast';
import { sendSOS, watchStudentSOSRequests } from '../api/sosApi';
import { colors, fontFamily } from '../theme/tokens';
import { buildSnapshot, type SOSRequest } from '../types';

export const HomePage: FC = () => {
  const [sosSent, setSosSent] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState<SOSRequest | null>(null);
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const { coords } = useGeolocation();
  const notif = useNotifications();
  const chats = useStudentChatThreads();
  const toast = useToast();
  const history = useHistory();
  const studentName = profile?.name || 'صديقي';

  // اشترك في طلبات SOS للطالب → اعرض النشط منها كـ banner
  useEffect(() => {
    if (!user) return;
    const unsub = watchStudentSOSRequests(user.uid, (list) => {
      const active = list.find((r) =>
        r.status === 'pending' || r.status === 'acknowledged' || r.status === 'enroute',
      );
      setActiveSOS(active ?? null);
    });
    return () => unsub();
  }, [user]);

  /** ضغط الزر يفتح المودال للتأكيد قبل الإرسال */
  const openSOSConfirm = () => { setConfirmOpen(true); };

  /** يُستدعى من المودال عند انتهاء العدّ التنازلي أو الضغط على "إرسال الآن" */
  const actuallySendSOS = async () => {
    setConfirmOpen(false);
    if (!profile) {
      toast.error('لم يُحمَّل ملفّك بعد. حاول لاحقاً');
      return;
    }
    try {
      const location = coords ?? { lat: 0, lng: 0 };
      await sendSOS({ snapshot: buildSnapshot(profile), location });
      setSosSent(true);
      toast.success('تم إرسال طلب النجدة • المساعدة قادمة', { duration: 4000 });
      window.setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      console.error('[sanad] فشل إرسال SOS:', err);
      toast.error('فشل إرسال الطلب. تحقّق من اتصالك');
    }
  };

  /** إلغاء المودال — لا يرسل شيئاً */
  const cancelSOS = () => {
    setConfirmOpen(false);
    toast.info('تم إلغاء طلب النجدة');
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس الصفحة */}
          <div style={{
            padding: '20px 20px 6px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>سند</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>مرحباً، {studentName} 👋</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* زر المحادثات */}
              <button
                onClick={() => history.push('/chats')}
                aria-label="محادثاتي"
                style={{
                  width: 40, height: 40, borderRadius: 13,
                  background: `${colors.primary}18`, border: `1.5px solid ${colors.primary}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                }}>
                <Icon name="phone" size={19} color={colors.primary} />
                {chats.totalUnread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 18, height: 18, padding: '0 5px',
                    borderRadius: 9, background: colors.danger,
                    color: colors.white, fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${colors.bg}`,
                    animation: 'breathe 1.5s ease-in-out infinite',
                  }}>
                    {chats.totalUnread > 9 ? '9+' : chats.totalUnread}
                  </span>
                )}
              </button>

              {/* زر الإشعارات */}
              <button
                onClick={() => setNotifOpen(true)}
                aria-label="الإشعارات"
                style={{
                  width: 40, height: 40, borderRadius: 13,
                  background: colors.primary, border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                }}>
                <Icon name="bell" size={19} color={colors.white} />
                {notif.unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 18, height: 18, padding: '0 5px',
                    borderRadius: 9, background: colors.danger,
                    color: colors.white, fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${colors.bg}`,
                  }}>
                    {notif.unreadCount > 9 ? '9+' : notif.unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* شريط نشط إن وُجد طلب SOS، وإلا شريط الموقع العادي */}
          {activeSOS ? (
            <ActiveSOSBanner
              request={activeSOS}
              onOpenChat={() => history.push(`/chat/${activeSOS.id}`)}
            />
          ) : (
            <StatusBanner sosSent={sosSent} />
          )}

          {/* الزر الكبير + الإجراءات السريعة */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 22,
            padding: '20px 0',
          }}>
            <SOSButton onTrigger={openSOSConfirm} />
            <div style={{ fontSize: 12, color: colors.textMuted }}>
              لمسة واحدة لإرسال طلب مساعدة فوري
            </div>
            <QuickActions
              onAmbulance={() => history.push('/tabs/contact')}
              onShelter={() => history.push('/tabs/map')}
              onCalm={() => history.push('/tabs/calm')}
            />
          </div>
        </div>

        {/* لوحة الإشعارات */}
        <NotificationsPanel
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
          notifications={notif.notifications}
          onItemRead={notif.markRead}
          onMarkAllRead={notif.markAllRead}
          onClearAll={notif.clearAll}
        />

        {/* مودال تأكيد SOS */}
        <SOSConfirmModal
          isOpen={confirmOpen}
          onCancel={cancelSOS}
          onConfirm={actuallySendSOS}
        />
      </IonContent>
    </IonPage>
  );
};
