// نظام إنذار صوتي للمنسّق — يُحاكي صوت interphone/walkie-talkie
// يدقّ كلّما وصل طلب SOS جديد، ويُكرّر كل 4 ثوانٍ حتى يُعلَم به المنسّق

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';

const REPEAT_MS = 4000;  // التكرار حتى التأكيد

/** يلعب نموذج صوت "بيب بيب" مزدوج عبر WebAudio */
const playBeepPattern = (ctx: AudioContext): void => {
  const now = ctx.currentTime;

  // 4 نبضات: high-low-high-low مثل تنبيهات الطوارئ
  const pattern: { freq: number; start: number; dur: number }[] = [
    { freq: 880, start: 0.00, dur: 0.18 },
    { freq: 660, start: 0.22, dur: 0.18 },
    { freq: 880, start: 0.50, dur: 0.18 },
    { freq: 660, start: 0.72, dur: 0.22 },
  ];

  pattern.forEach((p) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type   = 'square';   // قاسٍ ومُلفت
    osc.frequency.value = p.freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    // ظرف ADSR بسيط لتجنّب click
    const startAt = now + p.start;
    const stopAt  = now + p.start + p.dur;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.35, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    osc.start(startAt);
    osc.stop(stopAt + 0.05);
  });
};

interface Result {
  /** هل يدقّ الإنذار الآن */
  ringing: boolean;
  /** بدء الإنذار (يستمر حتى يُسكَت) */
  trigger: () => void;
  /** إسكات الإنذار */
  silence: () => void;
}

export const useEmergencyBuzzer = (): Result => {
  const ctxRef    = useRef<AudioContext | null>(null);
  const timerRef  = useRef<number | null>(null);
  const [ringing, setRinging] = useState(false);
  const haptics = useHaptics();

  // إنشاء AudioContext كسولاً (يحتاج تفاعل مستخدم لتفعيله)
  const ensureCtx = (): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const Cls = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Cls();
      }
      if (ctxRef.current.state === 'suspended') {
        void ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  };

  const playOnce = useCallback(() => {
    const ctx = ensureCtx();
    if (ctx) playBeepPattern(ctx);
    haptics.impact('heavy');
  }, [haptics]);

  const trigger = useCallback(() => {
    setRinging(true);
    playOnce();
    if (timerRef.current != null) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(playOnce, REPEAT_MS);
  }, [playOnce]);

  const silence = useCallback(() => {
    setRinging(false);
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
    if (ctxRef.current && ctxRef.current.state !== 'closed') void ctxRef.current.close();
  }, []);

  return { ringing, trigger, silence };
};
