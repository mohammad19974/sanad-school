// مزوّد حالة المصادقة العامة

import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';

interface AuthCtx {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: true });

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const value = useAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthCtx => useContext(AuthContext);
