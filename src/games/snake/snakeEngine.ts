// محرّك لعبة الثعبان — منطق نقيّ بدون React
// قابل للاختبار باستخدام unit tests

export interface Cell { x: number; y: number; }

export interface SnakeState {
  snake: Cell[];
  direction: Cell;
  nextDirection: Cell;
  food: Cell;
  score: number;
  level: number;       // المستوى = (الطعام المأكول / FOOD_PER_LEVEL) + 1
  gameOver: boolean;
  ateThisTick: boolean; // مفيد للـ haptics
}

export const COLS = 18;
export const ROWS = 18;

// ─── إعدادات السرعة ─────────────────────────────────
// تبدأ بطيئة جداً وتسرع تدريجياً، مع حدّ أقصى للسرعة
// قيم مكشوفة لتستخدمها الواجهة لحساب النسبة المئوية
export const BASE_TICK_MS = 320;   // البداية: ~3 خطوة/ثانية (مريح للأطفال)
export const MIN_TICK_MS  = 150;   // الأقصى: ~6.7 خطوة/ثانية (تحدّي معقول)
const SPEED_STEP_MS = 5;           // كل مستوى يقلّل 5ms
const FOOD_PER_LEVEL = 4;          // كل 4 طعام = مستوى جديد

/** يحسب السرعة كنسبة 0-100 (0 = أبطأ، 100 = أقصى) */
export const speedPercentFor = (tickMs: number): number => {
  const range = BASE_TICK_MS - MIN_TICK_MS;
  if (range <= 0) return 0;
  return Math.round(((BASE_TICK_MS - tickMs) / range) * 100);
};

/** يحسب سرعة التيك (ms) بناءً على عدد الطعام المأكول */
export const tickMsForScore = (score: number): number => {
  const eaten = score / 10;
  const level = Math.floor(eaten / FOOD_PER_LEVEL);
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - level * SPEED_STEP_MS);
};

/** المستوى المعروض للمستخدم (يبدأ من 1) */
export const levelForScore = (score: number): number => {
  const eaten = score / 10;
  return Math.floor(eaten / FOOD_PER_LEVEL) + 1;
};

// ─── منطق اللعبة ─────────────────────────────────────

const eq = (a: Cell, b: Cell): boolean => a.x === b.x && a.y === b.y;

const randomFood = (snake: Cell[]): Cell => {
  let pos: Cell;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => eq(s, pos)));
  return pos;
};

export const createInitialState = (): SnakeState => {
  // يبدأ بطول 3 — أحسن من 1 لأن المستخدم يرى الشكل فوراً
  const startSnake: Cell[] = [
    { x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 },
  ];
  return {
    snake: startSnake,
    direction:     { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: randomFood(startSnake),
    score: 0,
    level: 1,
    gameOver: false,
    ateThisTick: false,
  };
};

/** يطبّق خطوة واحدة على الحالة الحالية — يُرجع حالة جديدة */
export const step = (state: SnakeState): SnakeState => {
  if (state.gameOver) return state;

  const direction = state.nextDirection;
  const head = state.snake[0];
  const next: Cell = { x: head.x + direction.x, y: head.y + direction.y };

  // تصادم بالجدار
  if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
    return { ...state, gameOver: true, ateThisTick: false };
  }
  // تصادم بالذيل (نتجاهل المربّع الأخير لأن سيختفي إن لم نأكل)
  const bodyToCheck = state.snake.slice(0, -1);
  if (bodyToCheck.some((s) => eq(s, next))) {
    return { ...state, gameOver: true, ateThisTick: false };
  }

  const ate = eq(next, state.food);
  const newSnake = [next, ...(ate ? state.snake : state.snake.slice(0, -1))];
  const newScore = ate ? state.score + 10 : state.score;

  return {
    ...state,
    direction,
    snake: newSnake,
    food: ate ? randomFood(newSnake) : state.food,
    score: newScore,
    level: levelForScore(newScore),
    ateThisTick: ate,
  };
};

/** يحاول تغيير الاتجاه — يرفض الاتجاه المعاكس */
export const setDirection = (state: SnakeState, d: Cell): SnakeState => {
  if (d.x === -state.direction.x && d.y === -state.direction.y) return state;
  if (d.x === 0 && d.y === 0) return state;
  return { ...state, nextDirection: d };
};

export const DIRECTIONS = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1  },
  left:  { x: -1, y: 0  },
  right: { x: 1,  y: 0  },
} as const;
