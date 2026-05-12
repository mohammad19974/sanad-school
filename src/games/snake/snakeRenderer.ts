// رسم لعبة الثعبان على canvas — معزول عن React والمنطق
// تحسينات: توهّج للطعام، عيون متّجهة للأمام، تدرّج لون للجسم

import { COLS, ROWS, type SnakeState, type Cell } from './snakeEngine';

export const CELL = 18;  // أكبر قليلاً من السابق (16) — أوضح للأطفال
export const W = CELL * COLS;
export const H = CELL * ROWS;

const COLOR_BG       = '#0f1f0f';
const COLOR_GRID     = 'rgba(125,184,138,0.06)';
const COLOR_FOOD     = '#C8853A';
const COLOR_FOOD_HI  = '#FFB870';
const COLOR_HEAD     = '#7DB88A';
const COLOR_HEAD_HI  = '#A8D5B3';
const COLOR_BORDER   = 'rgba(74,124,89,0.4)';

export const drawSnake = (
  ctx: CanvasRenderingContext2D,
  state: SnakeState,
  glow = 0,  // قيمة 0-1 للتأثير عند الأكل (يومض الطعام)
): void => {
  // ─── خلفية ───
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);

  // ─── إطار اللعبة ───
  ctx.strokeStyle = COLOR_BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // ─── شبكة دقيقة ───
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 0.5;
  for (let x = 1; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, H);
    ctx.stroke();
  }
  for (let y = 1; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(W, y * CELL);
    ctx.stroke();
  }

  // ─── الطعام مع توهّج ───
  drawFood(ctx, state.food, glow);

  // ─── الثعبان ───
  drawSnakeBody(ctx, state);
};

const drawFood = (ctx: CanvasRenderingContext2D, food: Cell, glow: number): void => {
  const cx = food.x * CELL + CELL / 2;
  const cy = food.y * CELL + CELL / 2;
  const r  = CELL / 2 - 2;

  // توهّج خارجي
  const glowR = r + 4 + glow * 8;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, glowR);
  grad.addColorStop(0, `rgba(255,184,112,${0.4 + glow * 0.4})`);
  grad.addColorStop(1, 'rgba(255,184,112,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  // جسم الطعام (دائرة متدرّجة)
  const ballGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  ballGrad.addColorStop(0, COLOR_FOOD_HI);
  ballGrad.addColorStop(1, COLOR_FOOD);
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // ورقة صغيرة في الأعلى
  ctx.fillStyle = '#7DB88A';
  ctx.beginPath();
  ctx.ellipse(cx + 1, cy - r + 1, 2.5, 1.5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
};

const drawSnakeBody = (ctx: CanvasRenderingContext2D, state: SnakeState): void => {
  const { snake, direction } = state;
  const total = snake.length;

  // الجسم من الذيل إلى الرأس (الرأس يُرسم آخراً ليكون فوق)
  for (let i = total - 1; i >= 0; i--) {
    const seg = snake[i];
    const isHead = i === 0;
    const ratio = i / Math.max(total, 1);
    // تدرّج من الرأس الفاتح إلى الذيل الداكن قليلاً
    if (isHead) {
      const grad = ctx.createLinearGradient(
        seg.x * CELL, seg.y * CELL,
        (seg.x + 1) * CELL, (seg.y + 1) * CELL,
      );
      grad.addColorStop(0, COLOR_HEAD_HI);
      grad.addColorStop(1, COLOR_HEAD);
      ctx.fillStyle = grad;
    } else {
      const a = 1 - ratio * 0.35;
      ctx.fillStyle = `rgba(74,124,89,${a})`;
    }
    roundedRect(
      ctx,
      seg.x * CELL + 1, seg.y * CELL + 1,
      CELL - 2, CELL - 2,
      isHead ? 6 : 4,
    );
    ctx.fill();
  }

  // عينان على الرأس (تتّجهان حسب الاتجاه)
  const head = snake[0];
  drawEyes(ctx, head, direction);
};

const drawEyes = (ctx: CanvasRenderingContext2D, head: Cell, dir: Cell): void => {
  const cx = head.x * CELL + CELL / 2;
  const cy = head.y * CELL + CELL / 2;
  const offset = CELL * 0.22;
  const eyeR = 2.2;
  const pupilR = 1.3;

  // مواضع العينين متعامدة على اتجاه الحركة
  let e1x = cx, e1y = cy, e2x = cx, e2y = cy;
  if (dir.x !== 0) {
    e1x += dir.x * offset; e2x += dir.x * offset;
    e1y -= offset; e2y += offset;
  } else {
    e1y += dir.y * offset; e2y += dir.y * offset;
    e1x -= offset; e2x += offset;
  }

  // بياض العينين
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2); ctx.fill();

  // البؤبؤان (يتقدّمان قليلاً نحو الاتجاه)
  ctx.fillStyle = '#0f1f0f';
  ctx.beginPath();
  ctx.arc(e1x + dir.x * 0.6, e1y + dir.y * 0.6, pupilR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.arc(e2x + dir.x * 0.6, e2y + dir.y * 0.6, pupilR, 0, Math.PI * 2); ctx.fill();
};

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void => {
  ctx.beginPath();
  // fallback لو roundRect غير متاح
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
};
