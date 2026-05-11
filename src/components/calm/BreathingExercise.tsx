// تمرين التنفس 4-7-8: شهيق 4 ثوانٍ، احبس 7، زفير 8
// كل مرحلة تُرسل haptic بسيط لتذكير المستخدم

import { useEffect, useRef, useState, type FC } from 'react';
import { PillButton } from '../../ui/PillButton';
import { useHaptics } from '../../hooks/useHaptics';
import { colors, fontFamily } from '../../theme/tokens';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale';

const phaseLabel: Record<Phase, string> = {
  idle:   'استعد',
  inhale: 'شهيق...',
  hold:   'احبس...',
  exhale: 'زفير...',
};

// المدد بالميلي ثانية
const DURATIONS = { inhale: 4000, hold: 7000, exhale: 8000 };

export const BreathingExercise: FC = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [running, setRunning] = useState(false);
  const haptics = useHaptics();
  const timersRef = useRef<number[]>([]);

  // ينظّف جميع المؤقّتات
  const clearTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  const runCycle = () => {
    setPhase('inhale');
    haptics.impact('light');
    const t1 = window.setTimeout(() => {
      setPhase('hold');
      haptics.impact('medium');
      const t2 = window.setTimeout(() => {
        setPhase('exhale');
        haptics.impact('light');
        const t3 = window.setTimeout(() => {
          // كرّر الدورة 3 مرّات ثم انتهِ
          setPhase('idle');
          setRunning(false);
        }, DURATIONS.exhale);
        timersRef.current.push(t3);
      }, DURATIONS.hold);
      timersRef.current.push(t2);
    }, DURATIONS.inhale);
    timersRef.current.push(t1);
  };

  const start = () => {
    if (running) return;
    setRunning(true);
    runCycle();
  };

  useEffect(() => () => clearTimers(), []);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 164, height: 164, borderRadius: '50%',
        background: 'rgba(255,255,255,0.13)',
        border: '2px solid rgba(255,255,255,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: running ? 'breathe 4s ease-in-out infinite' : 'none',
        transition: 'all 0.5s',
      }}>
        <div style={{
          width: 112, height: 112, borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: colors.white, fontFamily }}>
            {phaseLabel[phase]}
          </span>
        </div>
      </div>
      <PillButton onClick={start} disabled={running} variant="white">
        {running ? 'جارٍ التمرين...' : 'ابدأ التنفس'}
      </PillButton>
    </div>
  );
};
