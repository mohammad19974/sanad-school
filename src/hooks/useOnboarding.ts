// hook بسيط لتذكّر ما إذا أنهى المستخدم شاشات التعريف

import { useCallback, useState } from 'react';

const KEY = 'sanad.onboarded.v1';

export const useOnboarding = () => {
  const [onboarded, setOnboarded] = useState<boolean>(
    () => localStorage.getItem(KEY) === '1',
  );

  const finish = useCallback(() => {
    localStorage.setItem(KEY, '1');
    setOnboarded(true);
  }, []);

  /** للاختبار: أعد عرض الـ onboarding */
  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setOnboarded(false);
  }, []);

  return { onboarded, finish, reset };
};
