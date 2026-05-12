// لوحة chat كاملة — رسائل + ردود سريعة + إدخال نصّ + مشاركة موقع

import { useEffect, useRef, useState, type FC } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { MessageBubble } from './MessageBubble';
import { QuickReplies } from './QuickReplies';
import { Icon } from '../../ui/Icon';
import { useChat } from '../../hooks/useChat';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { colors, fontFamily } from '../../theme/tokens';
import type { UserRole } from '../../types';

interface Props {
  requestId: string;
  myRole: UserRole;
}

export const ChatPanel: FC<Props> = ({ requestId, myRole }) => {
  const { user } = useAuthContext();
  const chat = useChat(requestId);
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [sendingLoc, setSendingLoc] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // التمرير لأسفل عند وصول رسالة جديدة
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chat.messages.length]);

  const submit = async (text: string) => {
    if (!text.trim()) return;
    await chat.send(text, 'text');
    setDraft('');
  };

  const submitQuick = async (text: string) => {
    await chat.send(text, 'quick');
  };

  /** يجلب الموقع الحالي ويرسله كرسالة chat */
  const shareLocation = async () => {
    if (sendingLoc) return;
    setSendingLoc(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.requestPermissions();
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, timeout: 10000,
      });
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      const acc = pos.coords.accuracy ? ` (±${Math.round(pos.coords.accuracy)}م)` : '';
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      const text = `📍 موقعي الحالي${acc}\n${url}`;
      await chat.send(text, 'text');
      toast.success('تم إرسال الموقع');
    } catch (err) {
      console.error('[chat] failed to share location:', err);
      toast.error('تعذّر الحصول على الموقع');
    } finally {
      setSendingLoc(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0,
      background: colors.bg,
      fontFamily, direction: 'rtl',
    }}>
      {/* قائمة الرسائل — flex:1 + minHeight:0 لتعمل overflowY بشكل صحيح */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, minHeight: 0,
          overflowY: 'auto', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        {chat.loading ? (
          <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: 12, padding: 20 }}>
            جاري التحميل...
          </div>
        ) : chat.messages.length === 0 ? (
          <EmptyState role={myRole} />
        ) : (
          chat.messages.map((m) => {
            const isMine = m.senderUid === user?.uid;
            // قُرئت من الطرف الآخر؟ — عند الرسائل التي أرسلتُها أنا فقط
            const isRead = isMine && chat.otherLastSeen >= m.createdAt;
            return (
              <MessageBubble
                key={m.id}
                message={m}
                isMine={isMine}
                isRead={isRead}
              />
            );
          })
        )}

        {/* مؤشّر "يكتب الآن" */}
        {chat.othersTyping.length > 0 && (
          <TypingIndicator name={chat.othersTyping[0].name} />
        )}
      </div>

      {/* الردود السريعة */}
      <QuickReplies role={myRole} onSelect={submitQuick} />

      {/* صندوق الكتابة + زر الموقع */}
      <form
        onSubmit={(e) => { e.preventDefault(); submit(draft); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px 14px',
          borderTop: `1px solid ${colors.bgDark}`,
          background: colors.bgCard,
          direction: 'rtl',
        }}
      >
        {/* زر مشاركة الموقع */}
        <button
          type="button"
          onClick={shareLocation}
          disabled={sendingLoc}
          title="مشاركة موقعي"
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: sendingLoc ? colors.bgDark : `${colors.primary}18`,
            border: `1.5px solid ${colors.primary}40`,
            cursor: sendingLoc ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            opacity: sendingLoc ? 0.5 : 1,
          }}
        >
          {sendingLoc ? '⏳' : '📍'}
        </button>

        <input
          type="text"
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            chat.onTyping(v.length > 0);
          }}
          onBlur={() => chat.onTyping(false)}
          placeholder="اكتب رسالة..."
          style={{
            flex: 1, padding: '12px 14px', borderRadius: 22,
            border: `1.5px solid ${colors.bgDark}`,
            background: colors.bg, fontSize: 14, fontFamily,
            outline: 'none', color: colors.text, textAlign: 'right',
            minWidth: 0,
          }}
        />

        {/* زر إرسال — أيقونة طائرة ورقية SVG */}
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="إرسال"
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: draft.trim() ? colors.primary : colors.bgDark,
            border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

/** أيقونة "طائرة ورقية" — تشير لليسار في RTL */
const SendIcon: FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    style={{ transform: 'scaleX(-1)' }}>
    <path d="M2 21l21-9L2 3v7l15 2-15 2z" fill="white" />
  </svg>
);

/** فقاعة "يكتب الآن..." مع 3 نقاط متحرّكة */
const TypingIndicator: FC<{ name: string }> = ({ name }) => (
  <div style={{
    alignSelf: 'flex-end',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    gap: 4, marginTop: 4,
  }}>
    <div style={{
      fontSize: 10, color: colors.textMuted,
      padding: '0 6px', fontFamily,
    }}>{name} يكتب...</div>
    <div style={{
      background: colors.bgCard,
      padding: '12px 16px',
      borderRadius: 16,
      borderTopLeftRadius: 4,
      boxShadow: `0 1px 4px ${colors.cardShadow}`,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: colors.primary,
            animation: `breathe 1s ease-in-out ${i * 0.15}s infinite`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  </div>
);

const EmptyState: FC<{ role: UserRole }> = ({ role }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    color: colors.textMuted, padding: 30,
  }}>
    <Icon name="phone" size={40} color={colors.primaryLight} />
    <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
      ابدأ المحادثة
    </div>
    <div style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.6 }}>
      {role === 'student'
        ? 'يمكنك إرسال ردّ سريع أو كتابة رسالة أو مشاركة موقعك'
        : 'تواصل مع الطالب لطمأنته وتوجيهه'}
    </div>
  </div>
);
