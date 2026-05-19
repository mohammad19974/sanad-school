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
import { ActiveSOSOptionsSheet } from '../components/home/ActiveSOSOptionsSheet';
import { VoiceTriggerIndicator } from '../components/home/VoiceTriggerIndicator';
import { Icon } from '../ui/Icon';
import { useAuthContext } from '../context/AuthContext';
import { useProfileContext } from '../context/ProfileContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNotifications } from '../hooks/useNotifications';
import { useStudentChatThreads } from '../hooks/useStudentChatThreads';
import { useOnline } from '../hooks/useOnline';
import { useSmsLog } from '../hooks/useSmsLog';
import { useToast } from '../hooks/useToast';
import { useVoiceTrigger } from '../hooks/useVoiceTrigger';
import { buildSosSmsBody, openSmsCompose, pickSmsRecipients } from '../helpers/smsHelper';
import { sendSOS, watchStudentSOSRequests, cancelMySOS } from '../api/sosApi';
import { colors, fontFamily } from '../theme/tokens';
import { buildSnapshot, type SOSRequest } from '../types';

export const HomePage: FC = () => {
  const [sosSent, setSosSent] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [activeSOS, setActiveSOS] = useState<SOSRequest | null>(null);
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const { coords } = useGeolocation();
  const notif = useNotifications();
  const chats = useStudentChatThreads();
  const online = useOnline();
  const smsLog = useSmsLog();
  const toast = useToast();
  const history = useHistory();

  // ─── التفعيل الصوتي ─────────────────────────
  // مُفعَّل فقط لو profile.settings.voiceInput = true
  const voiceEnabled = !!profile?.settings?.voiceInput;
  const voice = useVoiceTrigger(voiceEnabled, () => {
    // قائلاً "نجدة" → افتح مودال التأكيد (نفس مسلك زر SOS)
    toast.info('🎤 تم اكتشاف نداء نجدة', { duration: 2500 });
    setConfirmOpen(true);
  });
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

  /** ضغط الزر يفتح:
   *   - شيت خيارات إن كان هناك طلب نشط (محادثة / تهدئة / إلغاء)
   *   - مودال تأكيد لإرسال طلب جديد (في كل الحالات الأخرى)
   */
  const openSOSConfirm = () => {
    if (activeSOS) {
      setOptionsOpen(true);
    } else {
      setConfirmOpen(true);
    }
  };

  const handleOpenChat = () => {
    if (!activeSOS) return;
    setOptionsOpen(false);
    history.push(`/chat/${activeSOS.id}`);
  };

  const handleOpenCalm = () => {
    setOptionsOpen(false);
    history.push('/tabs/calm');
  };

  const handleCancelActiveSOS = async () => {
    if (!activeSOS) return;
    setOptionsOpen(false);
    try {
      await cancelMySOS(activeSOS.id);
      toast.success('تم إلغاء طلب النجدة • أنت بخير الآن 💚', { duration: 4000 });
    } catch (err) {
      console.error('[sos] فشل الإلغاء:', err);
      toast.error('فشل إلغاء الطلب');
    }
  };

  // مستلِم SMS في وضع offline (أوّل جهة متاحة)
  const smsRecipients = profile ? pickSmsRecipients(profile) : [];
  const primarySmsRecipient = smsRecipients[0] ?? null;

  /** يُستدعى من المودال عند انتهاء العدّ التنازلي أو الضغط على "إرسال الآن" */
  const actuallySendSOS = async () => {
    setConfirmOpen(false);
    if (!profile) {
      toast.error('لم يُحمَّل ملفّك بعد. حاول لاحقاً');
      return;
    }
    const location = coords ?? { lat: 0, lng: 0 };

    // وضع offline → إرسال عبر SMS (شريحة الاتصال)
    if (!online) {
      if (!primarySmsRecipient) {
        toast.error('لا يوجد إنترنت ولم تُضف ولي الأمر. أضف رقمه من "حسابي"');
        return;
      }
      const body = buildSosSmsBody(profile, coords);
      // فتح تطبيق الرسائل بشريحة الاتصال
      openSmsCompose(primarySmsRecipient.phone, body);
      // تسجيل المحاولة محلياً
      smsLog.add({
        recipientName: primarySmsRecipient.name,
        recipientPhone: primarySmsRecipient.phone,
        body,
        reason: 'offline',
        location: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
      });
      // أيضاً نحاول كتابة Firestore — سيُحفظ محلياً ويُرسل عند عودة الاتصال
      sendSOS({ snapshot: buildSnapshot(profile), location })
        .catch((err) => console.warn('[sos] sentinel write queued offline:', err));
      setSosSent(true);
      toast.warning(`📨 تم فتح الرسائل لإرسال SMS إلى ${primarySmsRecipient.name}`, { duration: 5000 });
      window.setTimeout(() => setSosSent(false), 5000);
      return;
    }

    // وضع online — المسار الطبيعي
    try {
      await sendSOS({ snapshot: buildSnapshot(profile), location });
      setSosSent(true);
      toast.success('تم إرسال طلب النجدة • المساعدة قادمة', { duration: 4000 });
      window.setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      console.error('[sanad] فشل إرسال SOS:', err);
      // fallback لـ SMS لو كان لدينا مستلم
      if (primarySmsRecipient) {
        const body = buildSosSmsBody(profile, coords);
        openSmsCompose(primarySmsRecipient.phone, body);
        smsLog.add({
          recipientName: primarySmsRecipient.name,
          recipientPhone: primarySmsRecipient.phone,
          body, reason: 'offline',
          location: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
        });
        toast.warning('فشل الاتصال — استُخدم SMS احتياطاً', { duration: 5000 });
      } else {
        toast.error('فشل إرسال الطلب. تحقّق من اتصالك');
      }
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
              <div style={{ fontSize: 26, fontWeight: 800, color: colors.text }}>نبض</div>
              <div style={{ fontSize: 15, color: colors.textMuted, marginTop: 2 }}>مرحباً، {studentName} 👋</div>
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

          {/* مؤشّر التفعيل الصوتي — يظهر فقط لو مُفعَّل في إعدادات الطالب */}
          {voiceEnabled && <VoiceTriggerIndicator status={voice.status} />}

          {/* الزر الكبير + الإجراءات السريعة */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 22,
            padding: '20px 0',
          }}>
            <SOSButton onTrigger={openSOSConfirm} />
            <div style={{ fontSize: 15, color: colors.textMuted, fontWeight: 500 }}>
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

        {/* مودال تأكيد SOS — يظهر بوضع offline تلقائياً عند عدم الاتصال */}
        <SOSConfirmModal
          isOpen={confirmOpen}
          onCancel={cancelSOS}
          onConfirm={actuallySendSOS}
          offline={!online}
          smsRecipient={primarySmsRecipient?.name}
        />

        {/* شيت خيارات عند ضغط SOS مع وجود طلب نشط */}
        {activeSOS && (
          <ActiveSOSOptionsSheet
            isOpen={optionsOpen}
            onClose={() => setOptionsOpen(false)}
            request={activeSOS}
            onOpenChat={handleOpenChat}
            onOpenCalm={handleOpenCalm}
            onCancelSOS={handleCancelActiveSOS}
          />
        )}
      </IonContent>
    </IonPage>
  );
};
