// hook React للعبة الذاكرة
// يدير: مرحلة المعاينة + المؤقّت الزمني + أفضل نتيجة + haptics

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createMemoryState, flipCard, startPlaying, PREVIEW_MS,
  type MemoryState,
} from './memoryEngine';
import { useHaptics } from '../../hooks/useHaptics';

const REVEAL_MS = 800;             // مدّة عرض البطاقتين قبل قلبها
const BEST_KEY  = 'sanad.memory.best';  // {moves, seconds} JSON

interface BestRecord {
  moves: number;
  seconds: number;
}

interface Result {
  state: MemoryState;
  /** الزمن المنقضي بالثواني (يبدأ بعد المعاينة) */
  elapsedSec: number;
  /** المدّة المتبقّية في مرحلة المعاينة بالثواني */
  previewRemaining: number;
  best: BestRecord | null;
  isNewBest: boolean;
  flip: (cardId: number) => void;
  restart: () => void;
}

const readBest = (): BestRecord | null => {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? JSON.parse(raw) as BestRecord : null;
  } catch { return null; }
};

const writeBest = (rec: BestRecord) => {
  localStorage.setItem(BEST_KEY, JSON.stringify(rec));
};

/** يقارن نتيجتين — الأقل حركاتٍ أفضل، عند التعادل يُفضَّل الأسرع */
const isBetter = (next: BestRecord, prev: BestRecord | null): boolean => {
  if (!prev) return true;
  if (next.moves !== prev.moves) return next.moves < prev.moves;
  return next.seconds < prev.seconds;
};

export const useMemoryGame = (): Result => {
  const [state, setState] = useState<MemoryState>(() => createMemoryState());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [previewRemaining, setPreviewRemaining] = useState(Math.ceil(PREVIEW_MS / 1000));
  const [best, setBest] = useState<BestRecord | null>(() => readBest());
  const [isNewBest, setIsNewBest] = useState(false);

  const haptics = useHaptics();
  const previewTimerRef = useRef<number | null>(null);
  const tickTimerRef    = useRef<number | null>(null);
  const startMsRef      = useRef<number>(0);

  // ─── تنظيف المؤقّتات ─────────────────────────────
  const clearTimers = () => {
    if (previewTimerRef.current != null) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (tickTimerRef.current != null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  };

  // ─── انتقال preview → playing بعد PREVIEW_MS ─────
  useEffect(() => {
    if (state.status !== 'preview') return;
    setPreviewRemaining(Math.ceil(PREVIEW_MS / 1000));

    // عدّاد للأرقام الظاهرة (3..2..1)
    const previewStartMs = Date.now();
    const previewInterval = window.setInterval(() => {
      const remaining = Math.ceil((PREVIEW_MS - (Date.now() - previewStartMs)) / 1000);
      setPreviewRemaining(Math.max(0, remaining));
    }, 200);

    // بعد المدّة، اقلب الكلّ وابدأ اللعب
    previewTimerRef.current = window.setTimeout(() => {
      haptics.impact('medium');
      window.clearInterval(previewInterval);
      setState((s) => startPlaying(s));
      startMsRef.current = Date.now();
    }, PREVIEW_MS);

    return () => {
      window.clearInterval(previewInterval);
      if (previewTimerRef.current != null) {
        window.clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
    };
  }, [state.status, haptics]);

  // ─── مؤقّت الزمن أثناء اللعب ──────────────────────
  useEffect(() => {
    if (state.status !== 'playing') return;
    setElapsedSec(0);
    tickTimerRef.current = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startMsRef.current) / 1000));
    }, 1000);
    return () => {
      if (tickTimerRef.current != null) {
        window.clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [state.status]);

  // ─── حفظ أفضل نتيجة عند الانتهاء ──────────────────
  useEffect(() => {
    if (state.status !== 'finished') return;
    haptics.success();
    const final: BestRecord = { moves: state.moves, seconds: elapsedSec };
    if (isBetter(final, best)) {
      setBest(final);
      setIsNewBest(true);
      writeBest(final);
    } else {
      setIsNewBest(false);
    }
    // أوقف المؤقّت
    if (tickTimerRef.current != null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // تنظيف عند فك التركيب
  useEffect(() => () => clearTimers(), []);

  // ─── قلب بطاقة ─────────────────────────────────────
  const flip = useCallback((cardId: number) => {
    setState((prev) => {
      const { state: next, resolve } = flipCard(prev, cardId);
      if (resolve) {
        // كانت اختياراً ثانياً — اهتزاز خفيف
        haptics.impact('light');
        window.setTimeout(() => setState((curr) => resolve(curr)), REVEAL_MS);
      } else if (next.firstPick !== prev.firstPick) {
        // أوّل اختيار صحيح — tap خفيف جداً
        haptics.impact('light');
      }
      return next;
    });
  }, [haptics]);

  // ─── إعادة التشغيل ────────────────────────────────
  const restart = useCallback(() => {
    clearTimers();
    setIsNewBest(false);
    setElapsedSec(0);
    setState(createMemoryState());
  }, []);

  return {
    state,
    elapsedSec,
    previewRemaining,
    best,
    isNewBest,
    flip,
    restart,
  };
};
