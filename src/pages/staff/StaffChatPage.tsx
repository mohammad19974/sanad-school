// صفحة محادثة كاملة للمنسّق — مع بطاقة معلومات الطالب فوق + chat تحتها
// تختلف عن StaffSOSDetailPage: تركّز على المحادثة + معلومات سريعة

import { useEffect, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { StatusBadge } from '../../components/staff/StatusBadge';
import { ChatPanel } from '../../components/staff/ChatPanel';
import { watchSOSRequest } from '../../api/sosApi';
import { useAuthContext } from '../../context/AuthContext';
import { setLastSeen } from '../../hooks/useChatThreads';
import { colors, fontFamily } from '../../theme/tokens';
import type { SOSRequest } from '../../types';

export const StaffChatPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user } = useAuthContext();
  const [req, setReq] = useState<SOSRequest | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = watchSOSRequest(id, setReq);
    // علِّم المحادثة كمقروءة عند الدخول
    if (user) setLastSeen(user.uid, id);
    return () => unsub();
  }, [id, user]);

  // علّمها مقروءة كل 5 ثوانٍ أيضاً أثناء التواجد (للرسائل الواردة لحظياً)
  useEffect(() => {
    if (!id || !user) return;
    const t = window.setInterval(() => setLastSeen(user.uid, id), 5000);
    return () => window.clearInterval(t);
  }, [id, user]);

  const studentName = req?.studentSnapshot.name || 'طالب';
  const initial = studentName[0]?.toUpperCase() ?? '؟';

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} style={{ '--background': colors.bg }}>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          {/* رأس — direction:rtl صريح */}
          <div style={{
            padding: '18px 14px 12px',
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

            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.white, fontSize: 17, fontWeight: 800,
              flexShrink: 0,
            }}>{initial}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 800, color: colors.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{studentName}</div>
              <div style={{ fontSize: 11, color: colors.textMuted }}>
                {req ? statusSubtitle(req) : 'جاري التحميل...'}
              </div>
            </div>

            {req && <StatusBadge status={req.status} size="sm" />}

            <button
              onClick={() => history.push(`/staff/sos/${id}`)}
              title="التفاصيل الكاملة"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'transparent', border: `1.5px solid ${colors.bgDark}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.primary, fontSize: 18,
              }}
            >⓵</button>
          </div>

          {/* شريط معلومات الطالب السريع */}
          {req && (
            <div style={{
              padding: '8px 14px',
              background: colors.bg,
              borderBottom: `1px solid ${colors.bgDark}`,
              display: 'flex', gap: 6, overflowX: 'auto', whiteSpace: 'nowrap',
            }}>
              {req.studentSnapshot.blood && (
                <InfoChip emoji="🩸" text={`فصيلة ${req.studentSnapshot.blood}`} color={colors.danger} />
              )}
              {req.studentSnapshot.disability && (
                <InfoChip emoji="🦮" text={String(req.studentSnapshot.disability)} color={colors.primary} />
              )}
              {req.studentSnapshot.allergies && (
                <InfoChip emoji="⚠️" text={`حساسية: ${req.studentSnapshot.allergies}`} color={colors.warning} />
              )}
              {req.studentSnapshot.meds && (
                <InfoChip emoji="💊" text={String(req.studentSnapshot.meds)} color={colors.accent} />
              )}
              {req.studentSnapshot.guardianPhone && (
                <InfoChip
                  emoji="📞" text={`ولي الأمر`} color={colors.primary}
                  onClick={() => { window.location.href = `tel:${req.studentSnapshot.guardianPhone}`; }}
                />
              )}
            </div>
          )}

          {/* المحادثة — flex:1 + minHeight:0 ضروري ليبقى footer ثابتاً */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ChatPanel requestId={id} myRole="staff" />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const statusSubtitle = (req: SOSRequest): string => {
  if (req.status === 'pending') return 'في انتظار الاستجابة';
  if (req.status === 'acknowledged') return req.acknowledgedByName
    ? `استلمه ${req.acknowledgedByName}`
    : 'تمّ الاستلام';
  if (req.status === 'enroute') return 'الفريق في الطريق';
  if (req.status === 'resolved') return 'تمّ إنهاء الطلب';
  return 'مُلغى';
};

interface ChipProps { emoji: string; text: string; color: string; onClick?: () => void; }
const InfoChip: FC<ChipProps> = ({ emoji, text, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 10px', borderRadius: 50,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      fontSize: 11, fontWeight: 700, fontFamily,
      cursor: onClick ? 'pointer' : 'default',
      display: 'inline-flex', alignItems: 'center', gap: 4,
      flexShrink: 0,
    }}
  >
    <span>{emoji}</span>
    <span>{text}</span>
  </button>
);
