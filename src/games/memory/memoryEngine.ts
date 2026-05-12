// محرّك لعبة الذاكرة — منطق نقيّ
// 16 بطاقة = 8 أزواج من رموز الأمان والطوارئ
// طور المراحل: preview → playing → finished

export type GameStatus = 'preview' | 'playing' | 'finished';

export interface MemoryCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryState {
  status: GameStatus;
  cards: MemoryCard[];
  moves: number;
  matches: number;
  /** فهرس البطاقة المقلوبة الأولى، أو null */
  firstPick: number | null;
  /** هل اللعبة منتهية (كل البطاقات مطابقة) */
  finished: boolean;
}

// مدّة عرض البطاقات في البداية بالميلي ثانية
export const PREVIEW_MS = 3500;

const SYMBOLS = ['🚑', '🛡️', '🚒', '⛑️', '🦮', '🏥', '💊', '🩺'];
export const TOTAL_PAIRS = SYMBOLS.length;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** ينشئ حالة جديدة — البطاقات مكشوفة لمدّة المعاينة */
export const createMemoryState = (): MemoryState => {
  const pairs = shuffle([...SYMBOLS, ...SYMBOLS]);
  return {
    status: 'preview',
    cards: pairs.map((symbol, id) => ({
      id, symbol,
      flipped: true,    // كل البطاقات مكشوفة في البداية
      matched: false,
    })),
    moves: 0,
    matches: 0,
    firstPick: null,
    finished: false,
  };
};

/** ينهي مرحلة المعاينة ويبدأ اللعب — يقلب كل البطاقات للخلف */
export const startPlaying = (state: MemoryState): MemoryState => {
  if (state.status !== 'preview') return state;
  return {
    ...state,
    status: 'playing',
    cards: state.cards.map((c) => ({ ...c, flipped: false })),
  };
};

/** يحاول قلب بطاقة — يُرجع الحالة الجديدة ودالة لإنهاء المطابقة */
export interface FlipResult {
  state: MemoryState;
  /** بعد التأخير، استدعِ resolve لتطبيق نتيجة المطابقة */
  resolve?: (current: MemoryState) => MemoryState;
}

export const flipCard = (state: MemoryState, cardId: number): FlipResult => {
  if (state.status !== 'playing' || state.finished) return { state };
  const card = state.cards[cardId];
  if (card.flipped || card.matched) return { state };

  // قلب البطاقة
  const flipped = state.cards.map((c) => c.id === cardId ? { ...c, flipped: true } : c);

  // اختيار أوّل
  if (state.firstPick == null) {
    return { state: { ...state, cards: flipped, firstPick: cardId } };
  }

  // اختيار ثانٍ
  const first = state.cards[state.firstPick];
  const isMatch = first.symbol === card.symbol;
  const newMoves = state.moves + 1;

  const after: MemoryState = {
    ...state,
    cards: flipped,
    moves: newMoves,
    firstPick: null,
  };

  const resolve = (curr: MemoryState): MemoryState => {
    if (isMatch) {
      const updated = curr.cards.map((c) =>
        c.id === card.id || c.id === first.id ? { ...c, matched: true } : c,
      );
      const matches = curr.matches + 1;
      return {
        ...curr,
        cards: updated,
        matches,
        finished: matches === TOTAL_PAIRS,
        status: matches === TOTAL_PAIRS ? 'finished' : curr.status,
      };
    } else {
      // إعادة قلب كلا البطاقتين
      const updated = curr.cards.map((c) =>
        (c.id === card.id || c.id === first.id) && !c.matched
          ? { ...c, flipped: false } : c,
      );
      return { ...curr, cards: updated };
    }
  };

  return { state: after, resolve };
};
