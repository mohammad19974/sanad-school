// صفحة محادثات الطالب — كل طلبات نجدته السابقة + النشطة

import type { FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { ChatThreadCard } from '../components/staff/ChatThreadCard';
import { useStudentChatThreads } from '../hooks/useStudentChatThreads';
import { colors, fontFamily } from '../theme/tokens';

export const StudentChatListPage: FC = () => {
  const history = useHistory();
  const { threads, loading, totalUnread } = useStudentChatThreads();

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس — direction:rtl صريح */}
          <div style={{
            padding: '20px 16px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
            background: colors.bgCard,
            borderBottom: `1px solid ${colors.bgDark}`,
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
              <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
                💬 محادثاتي
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                {totalUnread > 0
                  ? `${totalUnread} رسالة جديدة من المنسّق`
                  : threads.length > 0
                    ? `${threads.length} طلب سابق`
                    : 'لا توجد طلبات سابقة'}
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

          {/* القائمة */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 12,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: colors.textMuted, padding: 30 }}>
                جاري التحميل...
              </div>
            ) : threads.length === 0 ? (
              <EmptyState />
            ) : (
              threads.map((t) => (
                <ChatThreadCard
                  key={t.request.id}
                  thread={t}
                  onClick={() => history.push(`/chat/${t.request.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const EmptyState: FC = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 10, padding: '60px 20px',
  }}>
    <div style={{ fontSize: 56 }}>💬</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily }}>
      لا توجد محادثات بعد
    </div>
    <div style={{ fontSize: 12, color: colors.textMuted, fontFamily, textAlign: 'center', lineHeight: 1.6 }}>
      عند إرسال طلب نجدة، ستظهر هنا المحادثة مع المنسّق المسؤول.
    </div>
  </div>
);
