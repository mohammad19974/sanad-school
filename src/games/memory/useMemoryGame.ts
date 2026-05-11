// hook React للعبة الذاكرة

import { useCallback, useState } from 'react';
import { createMemoryState, flipCard, type MemoryState } from './memoryEngine';

const REVEAL_MS = 700;

interface Result {
  state: MemoryState;
  flip: (cardId: number) => void;
  restart: () => void;
}

export const useMemoryGame = (): Result => {
  const [state, setState] = useState<MemoryState>(() => createMemoryState());

  const flip = useCallback((cardId: number) => {
    setState((prev) => {
      const { state: next, resolve } = flipCard(prev, cardId);
      if (resolve) {
        // بعد التأخير، طبّق نتيجة المطابقة على آخر حالة
        window.setTimeout(() => setState((curr) => resolve(curr)), REVEAL_MS);
      }
      return next;
    });
  }, []);

  const restart = useCallback(() => setState(createMemoryState()), []);

  return { state, flip, restart };
};
