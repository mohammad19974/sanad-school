// hook يربط محرّك الثعبان بـ React + canvas
// يدعم: سرعة متدرّجة، إيقاف مؤقت، عدّ تنازلي، haptics

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialState, step, setDirection, tickMsForScore,
  DIRECTIONS, type SnakeState,
} from './snakeEngine';
import { drawSnake, W, H } from './snakeRenderer';
import { useHaptics } from '../../hooks/useHaptics';

const HIGH_SCORE_KEY = 'sanad.snake.highScore';
const COUNTDOWN_FROM = 3;

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'gameOver';

interface Result {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  status: GameStatus;
  score: number;
  highScore: number;
  level: number;
  speedMs: number;
  countdownValue: number;       // 3, 2, 1, 0
  newHighScore: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  go: (dir: 'up' | 'down' | 'left' | 'right') => void;
  W: number;
  H: number;
}

export const useSnakeGame = (): Result => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef  = useRef<SnakeState>(createInitialState());
  const timerRef  = useRef<number | null>(null);
  const glowRef   = useRef<number>(0); // 1 عند الأكل، يخفت تدريجياً
  const haptics   = useHaptics();

  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore]   = useState(0);
  const [level, setLevel]   = useState(1);
  const [speedMs, setSpeedMs] = useState(tickMsForScore(0));
  const [countdownValue, setCountdownValue] = useState(COUNTDOWN_FROM);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0));
  const [newHighScore, setNewHighScore] = useState(false);

  // ─── إيقاف المؤقّت بأمان ────────────────────────
  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // ─── الرسم ─────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawSnake(ctx, stateRef.current, glowRef.current);
    // يخفت التوهّج كل frame
    if (glowRef.current > 0) {
      glowRef.current = Math.max(0, glowRef.current - 0.08);
    }
  }, []);

  // ─── حلقة اللعبة (self-rescheduling setTimeout) ─
  const scheduleTick = useCallback(() => {
    const tickMs = tickMsForScore(stateRef.current.score);
    timerRef.current = window.setTimeout(() => {
      const next = step(stateRef.current);
      stateRef.current = next;

      if (next.ateThisTick) {
        glowRef.current = 1;
        haptics.impact('light');
      }

      setScore(next.score);
      setLevel(next.level);
      setSpeedMs(tickMsForScore(next.score));
      render();

      if (next.gameOver) {
        haptics.impact('heavy');
        setStatus('gameOver');
        if (next.score > highScore) {
          setHighScore(next.score);
          setNewHighScore(true);
          localStorage.setItem(HIGH_SCORE_KEY, String(next.score));
        }
        return;
      }

      scheduleTick(); // أعد جدولة التيك التالي بسرعة محدّثة
    }, tickMs);
  }, [render, haptics, highScore]);

  // ─── العدّ التنازلي قبل البدء ────────────────────
  const runCountdown = useCallback((onDone: () => void) => {
    setStatus('countdown');
    setCountdownValue(COUNTDOWN_FROM);
    let n = COUNTDOWN_FROM;
    haptics.impact('light');
    const iv = window.setInterval(() => {
      n -= 1;
      setCountdownValue(n);
      if (n > 0) {
        haptics.impact('light');
      } else {
        window.clearInterval(iv);
        haptics.impact('medium');
        onDone();
      }
    }, 700);
  }, [haptics]);

  // ─── بدء اللعبة ─────────────────────────────────
  const start = useCallback(() => {
    clearTimer();
    stateRef.current = createInitialState();
    glowRef.current = 0;
    setScore(0);
    setLevel(1);
    setSpeedMs(tickMsForScore(0));
    setNewHighScore(false);
    render();
    runCountdown(() => {
      setStatus('playing');
      scheduleTick();
    });
  }, [render, runCountdown, scheduleTick]);

  // ─── إيقاف مؤقت / استئناف ─────────────────────────
  const pause = useCallback(() => {
    if (status !== 'playing') return;
    clearTimer();
    setStatus('paused');
  }, [status]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    setStatus('playing');
    scheduleTick();
  }, [status, scheduleTick]);

  const togglePause = useCallback(() => {
    if (status === 'playing') pause();
    else if (status === 'paused') resume();
  }, [status, pause, resume]);

  // ─── تغيير الاتجاه ─────────────────────────────
  const go = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (status !== 'playing') return;
    stateRef.current = setDirection(stateRef.current, DIRECTIONS[dir]);
  }, [status]);

  // ─── التحكّم بلوحة المفاتيح ─────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':    go('up');    break;
        case 'ArrowDown':  go('down');  break;
        case 'ArrowLeft':  go('left');  break;
        case 'ArrowRight': go('right'); break;
        case 'p': case 'P': case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [go, togglePause]);

  // ─── الرسم الأوّلي + تنظيف ──────────────────────
  useEffect(() => {
    render();
    return () => clearTimer();
  }, [render]);

  return {
    canvasRef,
    status,
    score, highScore, level, speedMs,
    countdownValue,
    newHighScore,
    start, pause, resume, togglePause, go,
    W, H,
  };
};
