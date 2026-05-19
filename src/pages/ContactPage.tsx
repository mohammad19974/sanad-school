// صفحة جهات الاتصال للطوارئ + زر "اضغط وتكلم"
// الزر يفتح Web Speech Recognition، يستمع 10 ثوانٍ، ويُطلق SOS عند كلمات النجدة

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { ContactCard, type EmergencyContact } from '../components/contact/ContactCard';
import { Icon } from '../ui/Icon';
import { useProfileContext } from '../context/ProfileContext';
import { useToast } from '../hooks/useToast';
import { useVoiceTrigger } from '../hooks/useVoiceTrigger';
import { colors, fontFamily } from '../theme/tokens';

const STATIC_CONTACTS: EmergencyContact[] = [
  { name: 'الإطفاء والإنقاذ', number: '102', icon: 'fire',      color: '#E53935', desc: 'الحرائق والإنقاذ' },
  { name: 'نجمة داوود الحمراء', number: '101', icon: 'ambulance', color: '#FF7043', desc: 'الإسعاف الطبي' },
  { name: 'الشرطة',           number: '100', icon: 'police',    color: '#1565C0', desc: 'الأمن والنجدة' },
  { name: 'الجبهة الداخلية',  number: '104', icon: 'shield',    color: '#7B6FAD', desc: 'إنذارات الطوارئ المدنية' },
];

const LISTEN_DURATION_MS = 10_000;

export const ContactPage: FC = () => {
  const { profile } = useProfileContext();
  const toast = useToast();
  const history = useHistory();
  const [listening, setListening] = useState(false);

  // hook التفعيل الصوتي — يُشتغل فقط أثناء الضغط
  const voice = useVoiceTrigger(listening, () => {
    toast.success('🎤 تم اكتشاف نداء نجدة — جاري فتح SOS', { duration: 3000 });
    setListening(false);
    history.push('/tabs/home?openSos=1'); // home سيفتح المودال
  });

  const startListening = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    toast.info('🎤 يستمع 10 ثوانٍ... قُل "نجدة" لطلب المساعدة', { duration: 3500 });
    window.setTimeout(() => setListening(false), LISTEN_DURATION_MS);
  };

  const personal: EmergencyContact[] = [];
  if (profile?.guardian.phone) {
    personal.push({
      name: profile.guardian.name || 'ولي الأمر',
      number: profile.guardian.phone,
      icon: 'family', color: colors.primary,
      desc: 'جهة تواصل طارئة',
    });
  }
  if (profile?.schoolCoordinator.phone) {
    personal.push({
      name: profile.schoolCoordinator.name || 'منسّق الطوارئ المدرسي',
      number: profile.schoolCoordinator.phone,
      icon: 'user', color: '#7B6FAD',
      desc: 'المدرسة والإرشاد',
    });
  }

  const all = [...STATIC_CONTACTS, ...personal];

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.bg }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: colors.bg, fontFamily, direction: 'rtl',
        }}>
          <div style={{ padding: '20px 20px 6px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>التواصل الفوري</div>
            <div style={{ fontSize: 15, color: colors.textMuted, marginTop: 2 }}>اتصل بلمسة واحدة</div>
          </div>

          <div style={{
            flex: 1, padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
            overflowY: 'auto',
          }}>
            {all.map((c, i) => (<ContactCard key={i} contact={c} />))}

            {/* زر "اضغط وتكلم" — يستمع 10 ثوانٍ ويطلق SOS عند الكلمات الحرجة */}
            <button
              onClick={startListening}
              disabled={voice.status === 'unsupported'}
              style={{
                width: '100%', padding: '15px', borderRadius: 16,
                background: listening
                  ? `linear-gradient(135deg, ${colors.danger}, #FF7043)`
                  : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, cursor: voice.status === 'unsupported' ? 'default' : 'pointer',
                boxShadow: `0 4px 16px ${listening ? colors.danger + '55' : colors.pulse}`,
                marginTop: 8,
                fontFamily,
                animation: listening ? 'breathe 1s ease-in-out infinite' : 'none',
              }}>
              <Icon name="mic" size={24} color={colors.white} />
              <span style={{ fontSize: 16, fontWeight: 700, color: colors.white }}>
                {listening
                  ? '🔴 يستمع الآن... قُل "نجدة"'
                  : 'اضغط وتكلم — نبض يستمع'}
              </span>
            </button>

            {/* عرض ما يُسمَع live */}
            {listening && voice.lastTranscript && (
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                background: colors.bgCard,
                border: `1.5px solid ${colors.primary}30`,
                fontFamily,
              }}>
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>
                  📝 سُمع:
                </div>
                <div style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>
                  {voice.lastTranscript}
                </div>
              </div>
            )}

            {/* رسالة لو الخدمة غير مدعومة */}
            {voice.status === 'unsupported' && (
              <div style={{
                padding: '10px 12px', borderRadius: 10,
                background: `${colors.warning}15`, color: colors.warning,
                fontSize: 12, fontFamily, textAlign: 'center',
              }}>
                ⚠️ متصفّحك لا يدعم التعرّف الصوتي
              </div>
            )}
            {voice.status === 'denied' && listening && (
              <div style={{
                padding: '10px 12px', borderRadius: 10,
                background: `${colors.danger}15`, color: colors.danger,
                fontSize: 12, fontFamily, textAlign: 'center',
              }}>
                ⚠️ إذن المايكروفون مرفوض — فعّله من إعدادات المتصفّح
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
