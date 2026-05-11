// محرّك لعبة الثعبان — منطق نقيّ بدون React
// قابل للاختبار باستخدام unit tests

export interface Cell { x: number; y: number; }
export interface SnakeState {
  snake: Cell[];
  direction: Cell;
  nextDirection: Cell;
  food: Cell;
  score: number;
  gameOver: boolean;
}

export const COLS = 18;
export const ROWS = 18;

const eq = (a: Cell, b: Cell): boolean => a.x === b.x && a.y === b.y;

const randomFood = (snake: Cell[]): Cell => {
  let pos: Cell;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => eq(s, pos)));
  return pos;
};

export const createInitialState = (): SnakeState => {
  const startSnake: Cell[] = [{ x: 9, y: 9 }];
  return {
    snake: startSnake,
    direction:     { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: randomFood(startSnake),
    score: 0,
    gameOver: false,
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
    return { ...state, gameOver: true };
  }
  // تصادم بالذيل
  if (state.snake.some((s) => eq(s, next))) {
    return { ...state, gameOver: true };
  }

  const ate = eq(next, state.food);
  const newSnake = [next, ...(ate ? state.snake : state.snake.slice(0, -1))];

  return {
    ...state,
    direction,
    snake: newSnake,
    food: ate ? randomFood(newSnake) : state.food,
    score: ate ? state.score + 10 : state.score,
  };
};

/** يحاول تغيير الاتجاه — يرفض الاتجاه المعاكس */
export const setDirection = (state: SnakeState, d: Cell): SnakeState => {
  if (d.x === -state.direction.x && d.y === -state.direction.y) return state;
  if (d.x === 0 && d.y === 0) return state;
  return { ...state, nextDirection: d };
};

// اتجاهات معروفة
export const DIRECTIONS = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1  },
  left:  { x: -1, y: 0  },
  right: { x: 1,  y: 0  },
} as const;
