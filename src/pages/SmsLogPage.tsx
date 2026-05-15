// صفحة سجل رسائل SMS الطوارئ — تُعرض على الطالب من ملفه الشخصي
// محليّة بالكامل (localStorage) — تعمل offline

import type { FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useSmsLog } from '../hooks/useSmsLog';
import { colors, fontFamily } from '../theme/tokens';
import type { SmsLogEntry } from '../types';

export const SmsLogPage: FC = () => {
  const history = useHistory();
  const log = useSmsLog();

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس */}
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
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>
                📨 سجل رسائل SMS الطوارئ
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                الرسائل المُرسَلة عبر شريحة الاتصال — تعمل بدون إنترنت
              </div>
            </div>
            {log.entries.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكّد من مسح كل السجل؟')) log.clear();
                }}
                style={{
                  padding: '6px 10px', borderRadius: 10,
                  background: 'transparent', border: `1px solid ${colors.bgDark}`,
                  color: colors.textMuted, fontFamily, fontSize: 11,
                  cursor: 'pointer',
                }}
              >مسح الكل</button>
            )}
          </div>

          {/* القائمة */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 12,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {log.entries.length === 0 ? (
              <EmptyState />
            ) : (
              log.entries.map((e) => (
                <SmsEntryCard key={e.id} entry={e} onRemove={() => log.remove(e.id)} />
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

interface CardProps { entry: SmsLogEntry; onRemove: () => void; }

const SmsEntryCard: FC<CardProps> = ({ entry, onRemove }) => (
  <div style={{
    background: colors.bgCard, borderRadius: 14,
    padding: 14, boxShadow: `0 2px 8px ${colors.cardShadow}`,
    fontFamily, display: 'flex', flexDirection: 'column', gap: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: entry.reason === 'offline' ? `${'#FF7043'}25` : `${colors.primary}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>📨</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
          {entry.recipientName}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, direction: 'ltr', textAlign: 'right' }}>
          {entry.recipientPhone}
        </div>
      </div>
      <div style={{ fontSize: 10, color: colors.textMuted }}>
        {formatDateTime(entry.createdAt)}
      </div>
    </div>

    {/* نصّ الرسالة */}
    <div style={{
      fontSize: 12, color: colors.text, lineHeight: 1.7,
      background: colors.bg, padding: '10px 12px', borderRadius: 10,
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      border: `1px solid ${colors.bgDark}`,
    }}>
      {entry.body}
    </div>

    {/* السبب + خريطة + حذف */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        padding: '3px 8px', borderRadius: 8,
        background: entry.reason === 'offline' ? '#FF704325' : `${colors.primary}25`,
        color: entry.reason === 'offline' ? '#FF7043' : colors.primary,
        fontSize: 10, fontWeight: 700,
      }}>
        {entry.reason === 'offline' ? 'بدون إنترنت' : 'يدوي'}
      </span>
      {entry.location && (
        <a
          href={`https://www.google.com/maps?q=${entry.location.lat},${entry.location.lng}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: 11, color: colors.primary, textDecoration: 'none',
            fontWeight: 600,
          }}
        >📍 الخريطة</a>
      )}
      <div style={{ flex: 1 }} />
      <button
        onClick={onRemove}
        style={{
          background: 'transparent', border: 'none',
          color: colors.danger, fontFamily, fontSize: 11, cursor: 'pointer',
          padding: '4px 8px',
        }}
      >حذف</button>
    </div>
  </div>
);

const EmptyState: FC = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 10, padding: '60px 20px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 56 }}>📭</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily }}>
      لا توجد رسائل في السجل
    </div>
    <div style={{ fontSize: 12, color: colors.textMuted, fontFamily, lineHeight: 1.6 }}>
      عند ضغط زر النجدة بدون إنترنت، سيُسجَّل هنا كل SMS تُرسله عبر شريحتك.
    </div>
  </div>
);

const formatDateTime = (ms: number): string =>
  new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  }).format(ms);
