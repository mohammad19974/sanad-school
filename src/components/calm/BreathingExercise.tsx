// تمرين التنفس 4-7-8: شهيق 4، احبس 7، زفير 8
// يعرض الآن: عدّاد تنازلي كبير + مرحلة + رقم الدورة + إجمالي الوقت

import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { PillButton } from '../../ui/PillButton';
import { useHaptics } from '../../hooks/useHaptics';
import { colors, fontFamily } from '../../theme/tokens';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

const phaseLabel: Record<Phase, string> = {
  idle:   'استعد',
  inhale: 'شهيق',
  hold:   'احبس',
  exhale: 'زفير',
};

// المدد بالميلي ثانية — تطبيق دقيق لتقنية 4-7-8
const DURATIONS: Record<Exclude<Phase, 'idle'>, number> = {
  inhale: 4000,
  hold:   7000,
  exhale: 8000,
};

const CYCLES_TARGET = 3; // 3 دورات = ~57 ثانية

export const BreathingExercise: FC = () => {
  const [phase, setPhase]               = useState<Phase>('idle');
  const [cycle, setCycle]               = useState(0);
  const [remainingMs, setRemainingMs]   = useState(0);
  const phaseStartRef                   = useRef<number>(0);
  const rafRef                          = useRef<number | null>(null);
  const haptics                         = useHaptics();

  const isRunning = phase !== 'idle';

  // مدّة المرحلة الحالية
  const currentDuration = phase === 'idle' ? 0 : DURATIONS[phase];
  // النسبة المتبقّية 0-1 (1 = البداية، 0 = النهاية)
  const progress = currentDuration > 0 ? remainingMs / currentDuration : 0;
  // الثواني المعروضة (تبدأ من المدّة وتعدّ نزولاً)
  const displaySeconds = Math.ceil(remainingMs / 1000);
  // الإجمالي بالثواني
  const totalSec = Math.round((DURATIONS.inhale + DURATIONS.hold + DURATIONS.exhale) / 1000);

  // ─── حلقة تحديث العدّاد (rAF لسلاسة) ─────────────
  const tick = useCallback(() => {
    const elapsed = Date.now() - phaseStartRef.current;
    const remaining = Math.max(0, currentDuration - elapsed);
    setRemainingMs(remaining);
    if (remaining > 0) {
      rafRef.current = window.requestAnimationFrame(tick);
    }
  }, [currentDuration]);

  // ─── الانتقال بين المراحل ─────────────────────────
  useEffect(() => {
    if (phase === 'idle') return;
    phaseStartRef.current = Date.now();
    setRemainingMs(currentDuration);
    haptics.impact(phase === 'hold' ? 'medium' : 'light');
    rafRef.current = window.requestAnimationFrame(tick);

    const next = window.setTimeout(() => {
      if (phase === 'inhale') setPhase('hold');
      else if (phase === 'hold') setPhase('exhale');
      else {
        // انتهت دورة كاملة
        setCycle((c) => {
          const newCycle = c + 1;
          if (newCycle >= CYCLES_TARGET) {
            haptics.success();
            setPhase('idle');
            return newCycle;
          }
          setPhase('inhale');
          return newCycle;
        });
      }
    }, currentDuration);

    return () => {
      window.clearTimeout(next);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    if (isRunning) return;
    setCycle(0);
    setPhase('inhale');
  };

  const stop = () => {
    setPhase('idle');
    setCycle(0);
    setRemainingMs(0);
    if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
  };

  // قياس الدائرة بناءً على المرحلة (شهيق = تتمدّد، زفير = تتقلّص)
  const circleScale =
    phase === 'inhale' ? 0.7 + (1 - progress) * 0.3 :   // 0.7 → 1.0
    phase === 'hold'   ? 1.0 :
    phase === 'exhale' ? 0.7 + progress * 0.3 :         // 1.0 → 0.7
    0.85;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 18,
      padding: '20px 16px',
    }}>
      {/* شريط الدورات */}
      {(isRunning || cycle > 0) && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: CYCLES_TARGET }, (_, i) => (
            <div
              key={i}
              style={{
                width: 22, height: 4, borderRadius: 2,
                background: i < cycle ? colors.white : 'rgba(255,255,255,0.3)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {/* الدائرة + العدّاد */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* الحلقة الخارجية للتقدّم */}
        <svg width={220} height={220} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx={110} cy={110} r={100}
            stroke="rgba(255,255,255,0.15)" strokeWidth={4} fill="none" />
          <circle cx={110} cy={110} r={100}
            stroke="rgba(255,255,255,0.7)" strokeWidth={4} fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 100}
            strokeDashoffset={(2 * Math.PI * 100) * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>

        {/* الدائرة المتمدّدة الداخلية */}
        <div style={{
          width: 170, height: 170, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          border: '2px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${circleScale})`,
          transition: 'transform 0.5s ease-in-out',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              fontSize: 64, fontWeight: 800, color: colors.white, fontFamily, lineHeight: 1,
            }}>
              {isRunning ? displaySeconds : '∞'}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily,
            }}>
              {phaseLabel[phase]}
            </div>
          </div>
        </div>
      </div>

      {/* تلميح + إجمالي وقت التمرين */}
      <div style={{
        textAlign: 'center', fontFamily,
        fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600,
      }}>
        {isRunning
          ? `الدورة ${cycle + 1} من ${CYCLES_TARGET} • تقنية 4-7-8`
          : `${CYCLES_TARGET} دورات × ${totalSec} ث • تقنية تهدئة 4-7-8`}
      </div>

      {/* الأزرار */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!isRunning ? (
          <PillButton onClick={start} variant="white">ابدأ التنفّس</PillButton>
        ) : (
          <PillButton onClick={stop} variant="outline">إيقاف</PillButton>
        )}
      </div>
    </div>
  );
};
