// مزوّد حالة الملف الشخصي للطالب الحالي

import { createContext, useContext, type FC, type ReactNode } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from './AuthContext';
import type { StudentProfile } from '../types';

interface ProfileCtx {
  profile: StudentProfile | null;
  loading: boolean;
  save: (patch: Partial<StudentProfile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileCtx>({
  profile: null, loading: true, save: async () => { /* noop */ },
});

export const ProfileProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const value = useProfile(user?.uid);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfileContext = (): ProfileCtx => useContext(ProfileContext);
