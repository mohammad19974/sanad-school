// لوحة إشعارات — تنبثق من أسفل الشاشة كـ half-sheet

import type { FC } from 'react';
import { IonModal } from '@ionic/react';
import { Icon, type IconName } from '../../ui/Icon';
import { colors, fontFamily } from '../../theme/tokens';
import type { AppNotification, NotificationKind } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onItemRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

// تخصيص بصري لكل نوع
const KIND_STYLE: Record<NotificationKind, { icon: IconName; color: string; label: string }> = {
  sos:     { icon: 'sos',       color: colors.danger,    label: 'نجدة' },
  drill:   { icon: 'shield',    color: colors.accent,    label: 'تمرين' },
  shelter: { icon: 'map',       color: colors.primary,   label: 'ملاجئ' },
  family:  { icon: 'family',    color: '#7B6FAD',        label: 'الأسرة' },
  school:  { icon: 'user',      color: '#1565C0',        label: 'المدرسة' },
  info:    { icon: 'bell',      color: colors.textMuted, label: 'معلومة' },
};

export const NotificationsPanel: FC<Props> = ({
  isOpen, onClose, notifications, onItemRead, onMarkAllRead, onClearAll,
}) => {
  const hasItems = notifications.length > 0;
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.7}
      breakpoints={[0, 0.45, 0.7, 0.95]}
      handle={true}
      style={{ '--background': colors.bg }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: colors.bg, fontFamily, direction: 'rtl',
      }}>
        {/* رأس */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 18px 12px',
          borderBottom: `1px solid ${colors.bgDark}`,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${colors.primary}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="bell" size={20} color={colors.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
              الإشعارات
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>
              {hasItems
                ? notifications.filter((n) => !n.read).length > 0
                  ? `${notifications.filter((n) => !n.read).length} غير مقروء`
                  : 'كل الإشعارات مقروءة'
                : 'لا توجد إشعارات'}
            </div>
          </div>
          {hasUnread && (
            <button
              onClick={onMarkAllRead}
              style={{
                background: 'transparent', border: 'none',
                color: colors.primary, fontFamily, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', padding: '6px 8px',
              }}
            >
              قراءة الكل
            </button>
          )}
        </div>

        {/* القائمة */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '8px 12px 20px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {hasItems ? (
            notifications.map((n) => (
              <NotificationCard
                key={n.id}
                item={n}
                onClick={() => { if (!n.read) onItemRead(n.id); }}
              />
            ))
          ) : (
            <EmptyState />
          )}

          {hasItems && (
            <button
              onClick={onClearAll}
              style={{
                marginTop: 12, padding: 10, borderRadius: 12,
                background: 'transparent',
                border: `1px solid ${colors.bgDark}`,
                color: colors.textMuted, fontFamily, fontSize: 12,
                cursor: 'pointer',
              }}
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>
    </IonModal>
  );
};

// ─── بطاقة إشعار واحد ──────────────────────────────

interface CardProps { item: AppNotification; onClick: () => void; }
const NotificationCard: FC<CardProps> = ({ item, onClick }) => {
  const style = KIND_STYLE[item.kind];
  const isUnread = !item.read;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', gap: 10, padding: '12px 12px',
        borderRadius: 14,
        background: isUnread ? colors.bgCard : 'transparent',
        border: `1px solid ${isUnread ? colors.bgDark : 'transparent'}`,
        boxShadow: isUnread ? `0 2px 6px ${colors.cardShadow}` : 'none',
        cursor: 'pointer',
        opacity: isUnread ? 1 : 0.72,
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: `${style.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name={style.icon} size={18} color={style.color} />
      </div>
      <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: colors.text, flex: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.title}
          </div>
          {isUnread && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: colors.primary, flexShrink: 0,
            }} />
          )}
        </div>
        <div style={{
          fontSize: 12, color: colors.textMuted, lineHeight: 1.5,
          marginBottom: 4,
        }}>
          {item.body}
        </div>
        <div style={{
          fontSize: 10, color: colors.textLight,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            padding: '2px 7px', borderRadius: 8,
            background: `${style.color}15`, color: style.color, fontWeight: 700,
          }}>{style.label}</span>
          <span>{relativeTime(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

const EmptyState: FC = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 8, padding: '40px 20px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 40 }}>🔕</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily }}>
      لا توجد إشعارات
    </div>
    <div style={{ fontSize: 12, color: colors.textMuted, fontFamily }}>
      ستظهر هنا تنبيهات المدرسة وولي الأمر
    </div>
  </div>
);

// ─── أداة: زمن نسبي بالعربية ───────────────────────

const relativeTime = (ms: number): string => {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / (1000 * 60));
  if (min < 1) return 'الآن';
  if (min < 60) return `قبل ${min} د`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `قبل ${day} يوم`;
  return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short' }).format(ms);
};
