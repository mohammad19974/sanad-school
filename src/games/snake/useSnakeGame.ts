// hook يربط محرّك الثعبان بـ React + canvas
// يرجع حالة كافية لرسم واجهة بسيطة وأزرار التحكّم

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialState, step, setDirection,
  DIRECTIONS, type SnakeState,
} from './snakeEngine';
import { drawSnake, W, H } from './snakeRenderer';

const TICK_MS = 160;
const HIGH_SCORE_KEY = 'sanad.snake.highScore';

interface Result {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  score: number;
  highScore: number;
  gameOver: boolean;
  started: boolean;
  start: () => void;
  go: (dir: 'up' | 'down' | 'left' | 'right') => void;
  W: number;
  H: number;
}

export const useSnakeGame = (): Result => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SnakeState>(createInitialState());
  const tickRef = useRef<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0));

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawSnake(ctx, stateRef.current);
  }, []);

  const stopTick = () => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const start = useCallback(() => {
    stopTick();
    stateRef.current = createInitialState();
    setScore(0);
    setGameOver(false);
    setStarted(true);
    render();
    tickRef.current = window.setInterval(() => {
      const next = step(stateRef.current);
      stateRef.current = next;
      setScore(next.score);
      if (next.gameOver) {
        stopTick();
        setGameOver(true);
        if (next.score > highScore) {
          setHighScore(next.score);
          localStorage.setItem(HIGH_SCORE_KEY, String(next.score));
        }
      }
      render();
    }, TICK_MS);
  }, [render, highScore]);

  const go = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    stateRef.current = setDirection(stateRef.current, DIRECTIONS[dir]);
  }, []);

  // التحكّم بلوحة المفاتيح
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':    go('up');    break;
        case 'ArrowDown':  go('down');  break;
        case 'ArrowLeft':  go('left');  break;
        case 'ArrowRight': go('right'); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [go]);

  // الرسم الأوّلي عند التحميل
  useEffect(() => {
    render();
    return () => stopTick();
  }, [render]);

  return { canvasRef, score, highScore, gameOver, started, start, go, W, H };
};
