// محرّك لعبة الذاكرة — منطق نقيّ
// 16 بطاقة = 8 أزواج من رموز الأمان والطوارئ

export interface MemoryCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryState {
  cards: MemoryCard[];
  moves: number;
  matches: number;
  /** فهرس البطاقة المقلوبة الأولى، أو null */
  firstPick: number | null;
  /** هل اللعبة منتهية (كل البطاقات مطابقة) */
  finished: boolean;
}

const SYMBOLS = ['🚑', '🛡️', '🚒', '⛑️', '🦮', '🏥', '💊', '🩺'];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const createMemoryState = (): MemoryState => {
  const pairs = shuffle([...SYMBOLS, ...SYMBOLS]);
  return {
    cards: pairs.map((symbol, id) => ({ id, symbol, flipped: false, matched: false })),
    moves: 0,
    matches: 0,
    firstPick: null,
    finished: false,
  };
};

/** يحاول قلب بطاقة — يُرجع الحالة الجديدة ودالة "complete" للتأخير قبل قلبها مرة أخرى */
export interface FlipResult {
  state: MemoryState;
  /** بعد 700ms استدعِ هذه لتعديل البطاقات (مطابقة أو إعادتها لوجهها) */
  resolve?: (current: MemoryState) => MemoryState;
}

export const flipCard = (state: MemoryState, cardId: number): FlipResult => {
  const card = state.cards[cardId];
  if (card.flipped || card.matched || state.finished) return { state };

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
        finished: matches === SYMBOLS.length,
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
