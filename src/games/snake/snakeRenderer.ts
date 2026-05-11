// رسم لعبة الثعبان على canvas — معزول عن React والمنطق

import { COLS, ROWS, type SnakeState } from './snakeEngine';

export const CELL = 16;
export const W = CELL * COLS;
export const H = CELL * ROWS;

const COLOR_BG    = '#1a2e1a';
const COLOR_GRID  = 'rgba(255,255,255,0.04)';
const COLOR_FOOD  = '#C8853A';
const COLOR_HEAD  = '#4A7C59';
const COLOR_BODY  = '#7DB88A';

export const drawSnake = (ctx: CanvasRenderingContext2D, state: SnakeState): void => {
  // خلفية
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // شبكة
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, H);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(W, y * CELL);
    ctx.stroke();
  }

  // الطعام (تفاحة)
  const f = state.food;
  ctx.fillStyle = COLOR_FOOD;
  ctx.beginPath();
  ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `${CELL - 4}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🍎', f.x * CELL + CELL / 2, f.y * CELL + CELL / 2 + 4);

  // الثعبان
  state.snake.forEach((seg, i) => {
    const ratio = i / state.snake.length;
    ctx.fillStyle = i === 0 ? COLOR_HEAD : `rgba(125,184,138,${1 - ratio * 0.5})`;
    // roundRect يدعم في معظم المتصفّحات الحديثة
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
    } else {
      ctx.rect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    }
    ctx.fill();
    if (i === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px sans-serif';
      ctx.fillText('👀', seg.x * CELL + CELL / 2, seg.y * CELL + CELL / 2 + 3);
    }
  });

  // إصلاح ألوان البقايا
  ctx.fillStyle = COLOR_BODY;
};
