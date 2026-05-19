// شاشات التعريف — 4 slides تشرح التطبيق للمستخدم الجديد

import { useRef, useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import { PillButton } from '../ui/PillButton';
import { useOnboarding } from '../hooks/useOnboarding';
import { colors, fontFamily } from '../theme/tokens';

interface Bullet { emoji: string; text: string; }
interface Slide {
  icon:    IconName;
  emoji:   string;
  title:   string;
  subtitle: string;
  bullets: Bullet[];
  accent:  string;
}

const SLIDES: Slide[] = [
  {
    icon: 'shield', emoji: '🛡️',
    title: 'مرحباً بك في نبض',
    subtitle: 'تطبيق طوارئ مصمَّم خصيصاً لك',
    bullets: [
      { emoji: '🤝', text: 'حماية ودعم للطلاب ذوي الإعاقة' },
      { emoji: '🏫', text: 'يربطك بمنسّق طوارئ مدرستك مباشرة' },
      { emoji: '🇸🇦', text: 'باللغة العربية بالكامل' },
    ],
    accent: colors.primary,
  },
  {
    icon: 'sos', emoji: '🆘',
    title: 'اطلب النجدة بلمسة',
    subtitle: 'مساعدة فورية وقت الحاجة',
    bullets: [
      { emoji: '📍', text: 'يُرسل موقعك الحالي تلقائياً' },
      { emoji: '🩸', text: 'يكشف بياناتك الطبية للمنقذ' },
      { emoji: '💬', text: 'تواصل مباشر معه عبر المحادثة' },
    ],
    accent: colors.danger,
  },
  {
    icon: 'calm', emoji: '🧘',
    title: 'هدوء أثناء الانتظار',
    subtitle: 'أدوات تخفّف القلق حتى وصول المساعدة',
    bullets: [
      { emoji: '🫁', text: 'تمرين التنفّس 4-7-8' },
      { emoji: '🌊', text: 'أصوات طبيعة هادئة' },
      { emoji: '🎮', text: 'ألعاب مهدّئة (ثعبان + ذاكرة)' },
    ],
    accent: '#7B6FAD',
  },
  {
    icon: 'user', emoji: '🔒',
    title: 'بياناتك الطبية بأمان',
    subtitle: 'تُعرض فقط لمنسّق الطوارئ وقت الحاجة',
    bullets: [
      { emoji: '🩺', text: 'فصيلة الدم + الأدوية + الحساسية' },
      { emoji: '👨‍👩‍👦', text: 'بيانات ولي الأمر للاتصال' },
      { emoji: '🔐', text: 'مشفّرة في سحابة Google' },
    ],
    accent: colors.accent,
  },
];

export const OnboardingPage: FC = () => {
  const [idx, setIdx] = useState(0);
  const { finish } = useOnboarding();
  const history = useHistory();
  const swipeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isLast = idx === SLIDES.length - 1;
  const next = () => isLast ? complete() : setIdx(idx + 1);
  const prev = () => idx > 0 && setIdx(idx - 1);
  const complete = () => { finish(); history.replace('/auth/login'); };

  // RTL swipe: يسار → التالي، يمين → السابق
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  };

  const slide = SLIDES[idx];

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false} style={{ '--background': colors.bg }}>
        <div
          style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: colors.bg, fontFamily, direction: 'rtl',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* تخطّي */}
          <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={complete}
              style={{
                background: 'transparent', border: 'none',
                color: colors.textMuted, fontFamily,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                padding: '6px 10px',
              }}
            >تخطّي</button>
          </div>

          {/* محتوى الشريحة */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px 24px', textAlign: 'center', gap: 18,
            minHeight: 0,
          }}>
            {/* أيقونة كبيرة + emoji عائم */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 120, height: 120, borderRadius: 36,
                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}aa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 16px 40px ${slide.accent}44`,
                animation: 'breathe 3s ease-in-out infinite',
              }}>
                <Icon name={slide.icon} size={60} color={colors.white} />
              </div>
              <div style={{
                position: 'absolute', top: -6, right: -6,
                width: 40, height: 40, borderRadius: '50%',
                background: colors.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>{slide.emoji}</div>
            </div>

            {/* العنوان والعنوان الفرعي */}
            <div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 6,
              }}>{slide.title}</div>
              <div style={{
                fontSize: 13, color: colors.textMuted, lineHeight: 1.5,
                maxWidth: 320,
              }}>{slide.subtitle}</div>
            </div>

            {/* قائمة المميزات */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              width: '100%', maxWidth: 340,
            }}>
              {slide.bullets.map((b, i) => (
                <div
                  key={i}
                  className="animate-in"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: `${slide.accent}10`,
                    border: `1px solid ${slide.accent}25`,
                    padding: '10px 14px', borderRadius: 14,
                    textAlign: 'right', fontFamily,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: `${slide.accent}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>{b.emoji}</div>
                  <div style={{
                    flex: 1, fontSize: 13, fontWeight: 600, color: colors.text,
                  }}>{b.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* مؤشّر النقاط */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8,
            padding: '0 0 16px',
          }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === idx ? slide.accent : colors.bgDark,
                  transition: 'all 0.3s', cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* أزرار التنقّل */}
          <div style={{
            padding: '0 24px 28px',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            {idx > 0 && (
              <button
                onClick={prev}
                style={{
                  width: 50, height: 50, borderRadius: 16,
                  background: colors.bgCard, border: `1.5px solid ${colors.bgDark}`,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: colors.primary, fontSize: 22, fontWeight: 700,
                }}
              >›</button>
            )}
            <div style={{ flex: 1 }}>
              <PillButton onClick={next} style={{ width: '100%' }}>
                {isLast ? 'لنبدأ ✨' : `التالي (${idx + 1}/${SLIDES.length})`}
              </PillButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
