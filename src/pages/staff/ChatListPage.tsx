// قائمة المحادثات للمنسّق — مثل WhatsApp/Telegram

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { ChatThreadCard } from '../../components/staff/ChatThreadCard';
import { useChatThreads } from '../../hooks/useChatThreads';
import { useAuthContext } from '../../context/AuthContext';
import { colors, fontFamily } from '../../theme/tokens';

export const ChatListPage: FC = () => {
  const history = useHistory();
  const { user } = useAuthContext();
  const { threads, loading, totalUnread } = useChatThreads(user?.uid, 'staff');
  const [search, setSearch] = useState('');

  const filtered = threads.filter((t) => {
    if (!search.trim()) return true;
    const name = t.request.studentSnapshot.name?.toLowerCase() ?? '';
    return name.includes(search.toLowerCase());
  });

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس */}
          <div style={{
            padding: '20px 16px 12px', background: colors.bgCard,
            borderBottom: `1px solid ${colors.bgDark}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
                  💬 المحادثات
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>
                  {totalUnread > 0
                    ? `${totalUnread} محادثة فيها رسائل جديدة`
                    : 'كل المحادثات مقروءة'}
                </div>
              </div>
              {totalUnread > 0 && (
                <div style={{
                  minWidth: 30, padding: '4px 10px',
                  borderRadius: 15, background: colors.danger,
                  color: colors.white, fontSize: 12, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{totalUnread}</div>
              )}
            </div>

            {/* بحث */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الطالب..."
                style={{
                  width: '100%', padding: '10px 36px 10px 14px', borderRadius: 12,
                  border: `1.5px solid ${colors.bgDark}`,
                  background: colors.bg, fontSize: 13, fontFamily,
                  outline: 'none', color: colors.text, textAlign: 'right',
                }}
              />
              <span style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', fontSize: 14, color: colors.textMuted,
              }}>🔍</span>
            </div>
          </div>

          {/* القائمة */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {loading ? (
              <CenterMsg>جاري الاتصال...</CenterMsg>
            ) : filtered.length === 0 ? (
              search.trim() ? (
                <CenterMsg>لا توجد محادثات تطابق "{search}"</CenterMsg>
              ) : (
                <EmptyState />
              )
            ) : (
              filtered.map((t) => (
                <ChatThreadCard
                  key={t.request.id}
                  thread={t}
                  onClick={() => history.push(`/staff/chats/${t.request.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const CenterMsg: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.textMuted, fontSize: 13, padding: 30, textAlign: 'center',
  }}>{children}</div>
);

const EmptyState: FC = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 10, padding: '50px 20px',
  }}>
    <div style={{ fontSize: 50 }}>💬</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
      لا توجد محادثات بعد
    </div>
    <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
      تظهر هنا محادثات الطلاب عند إرسالهم طلبات نجدة
    </div>
  </div>
);
