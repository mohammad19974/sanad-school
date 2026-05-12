// لوحة المنسّق — قائمة طلبات SOS الحيّة + إنذار صوتي تلقائي عند الجديد

import { useEffect, useRef, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { SOSCard } from '../../components/staff/SOSCard';
import { useStaffSosList } from '../../hooks/useStaffSosList';
import { useEmergencyBuzzer } from '../../hooks/useEmergencyBuzzer';
import { useWebNotifications } from '../../hooks/useWebNotifications';
import { NotificationPermissionBanner } from '../../components/staff/NotificationPermissionBanner';
import { useAuthContext } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import { signOut } from '../../api/authApi';
import { useToast } from '../../hooks/useToast';
import { colors, fontFamily } from '../../theme/tokens';

type Tab = 'active' | 'acknowledged' | 'resolved';

export const StaffDashboardPage: FC = () => {
  const history = useHistory();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  const { active, acknowledged, resolved, loading } = useStaffSosList();
  const buzzer = useEmergencyBuzzer();
  const webNotif = useWebNotifications();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('active');
  const lastActiveIdsRef = useRef<Set<string>>(new Set());

  // ─── تشغيل الإنذار + إشعار نظام التشغيل عند وصول طلب جديد ─────────
  useEffect(() => {
    const currentIds = new Set(active.map((r) => r.id));
    const previousIds = lastActiveIdsRef.current;
    const isFirstRun = previousIds.size === 0 && currentIds.size > 0;

    // ابحث عن طلبات جديدة (لم تكن موجودة سابقاً)
    const newRequests = active.filter((r) => !previousIds.has(r.id));

    if (newRequests.length > 0 && !isFirstRun) {
      buzzer.trigger();
      toast.error('⚠️ طلب نجدة جديد!', { duration: 5000 });

      // إشعار نظام التشغيل لكل طلب جديد (يعمل حتى لو tab في الخلفية)
      newRequests.forEach((req) => {
        const name = req.studentSnapshot.name || 'طالب';
        webNotif.notify(`🚨 طلب نجدة من ${name}`, {
          body: `موقع: ${req.location.lat.toFixed(4)}, ${req.location.lng.toFixed(4)}`,
          tag:  `sos-${req.id}`,
          data: { url: `/staff/sos/${req.id}` },
          vibrate: [200, 100, 200, 100, 200],
        });
      });
    }

    lastActiveIdsRef.current = currentIds;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.map((r) => r.id).join(',')]);

  // ─── إيقاف الإنذار عند مغادرة الصفحة ──────────────
  useEffect(() => () => buzzer.silence(), [buzzer]);

  const handleSignOut = async () => {
    try { await signOut(); toast.info('تم تسجيل الخروج'); history.replace('/auth/login'); }
    catch { toast.error('فشل تسجيل الخروج'); }
  };

  const list = tab === 'active' ? active : tab === 'acknowledged' ? acknowledged : resolved;

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bgSettings }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bgSettings, fontFamily, direction: 'rtl',
        }}>
          {/* رأس */}
          <div style={{
            padding: '20px 16px 12px', background: colors.bg,
            borderBottom: `1px solid ${colors.bgDark}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="shield" size={22} color={colors.white} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
                  لوحة الاستجابة
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>
                  {profile?.name || 'منسّق'} · {profile?.staffTitle || 'منسّق طوارئ'}
                </div>
              </div>
              {buzzer.ringing && (
                <button
                  onClick={buzzer.silence}
                  style={{
                    padding: '8px 14px', borderRadius: 12,
                    background: colors.danger, border: 'none', cursor: 'pointer',
                    color: colors.white, fontSize: 12, fontWeight: 700, fontFamily,
                    animation: 'breathe 0.8s ease-in-out infinite',
                  }}
                >🔇 إسكات الإنذار</button>
              )}
              <button
                onClick={handleSignOut}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'transparent', border: `1.5px solid ${colors.bgDark}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: colors.textMuted, fontSize: 16,
                }}
                title="تسجيل الخروج"
              >⏻</button>
            </div>

            {/* إحصائيات */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Stat label="نشطة" value={active.length}        color={colors.danger} />
              <Stat label="مُستلَمة" value={acknowledged.length} color={colors.accent} />
              <Stat label="منتهية" value={resolved.length}    color={colors.success} />
            </div>
          </div>

          {/* شريط طلب إذن الإشعارات (يختفي بعد التفعيل) */}
          <NotificationPermissionBanner />

          {/* تابات */}
          <div style={{
            display: 'flex', padding: '10px 12px 4px', gap: 6,
            borderBottom: `1px solid ${colors.bgDark}`, background: colors.bg,
          }}>
            <TabBtn active={tab === 'active'}       onClick={() => setTab('active')}      >نشطة ({active.length})</TabBtn>
            <TabBtn active={tab === 'acknowledged'} onClick={() => setTab('acknowledged')}>مُستلَمة ({acknowledged.length})</TabBtn>
            <TabBtn active={tab === 'resolved'}     onClick={() => setTab('resolved')}    >منتهية</TabBtn>
          </div>

          {/* القائمة */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '12px', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: 13, padding: 30 }}>
                جاري الاتصال بقاعدة البيانات...
              </div>
            ) : list.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              list.map((req) => (
                <SOSCard
                  key={req.id}
                  request={req}
                  isUnread={req.status === 'pending'}
                  onClick={() => {
                    buzzer.silence();
                    history.push(`/staff/sos/${req.id}`);
                  }}
                />
              ))
            )}
          </div>

          {/* تذكير معرّف المستخدم للديباغ */}
          {user && (
            <div style={{
              padding: '6px 16px', fontSize: 9, color: colors.textLight,
              textAlign: 'center',
            }}>
              ID: {user.uid.slice(0, 12)}...
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const Stat: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    flex: 1, padding: '10px 8px', borderRadius: 12,
    background: `${color}15`, border: `1px solid ${color}30`,
    textAlign: 'center', fontFamily,
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 600 }}>{label}</div>
  </div>
);

interface TabBtnProps { active: boolean; onClick: () => void; children: React.ReactNode; }
const TabBtn: FC<TabBtnProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
      background: active ? colors.primary : 'transparent',
      color: active ? colors.white : colors.textMuted,
      fontSize: 12, fontWeight: 700, fontFamily, transition: 'all 0.2s',
    }}
  >{children}</button>
);

const EmptyState: FC<{ tab: Tab }> = ({ tab }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '50px 20px',
  }}>
    <div style={{ fontSize: 44 }}>{tab === 'active' ? '✅' : '📋'}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily }}>
      {tab === 'active' ? 'لا توجد طلبات نشطة' : 'لا توجد عناصر هنا'}
    </div>
    <div style={{ fontSize: 11, color: colors.textMuted, fontFamily, textAlign: 'center' }}>
      {tab === 'active' && 'كل الطلبات تمّ التعامل معها بنجاح'}
    </div>
  </div>
);
