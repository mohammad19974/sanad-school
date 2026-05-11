// hook لمراقبة حالة المصادقة الحاليّة

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { watchAuthState } from '../api/authApi';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const unsub = watchAuthState((user) => setState({ user, loading: false }));
    return () => unsub();
  }, []);

  return state;
};
