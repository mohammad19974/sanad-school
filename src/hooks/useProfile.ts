// hook لجلب وتحديث ملف الطالب

import { useEffect, useState, useCallback } from 'react';
import { watchProfile, updateProfile as apiUpdate, getOrCreateProfile } from '../api/profileApi';
import type { StudentProfile } from '../types';

interface UseProfileResult {
  profile: StudentProfile | null;
  loading: boolean;
  save: (patch: Partial<StudentProfile>) => Promise<void>;
}

export const useProfile = (uid: string | undefined): UseProfileResult => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // تأكد من وجود مستند الطالب أولاً، ثم اشترك في التغييرات
  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let unsub: (() => void) | null = null;

    getOrCreateProfile(uid)
      .then(() => {
        unsub = watchProfile(uid, (p) => { setProfile(p); setLoading(false); });
      })
      .catch((err) => {
        console.error('[useProfile] فشل جلب الملف:', err);
        setLoading(false);
      });

    return () => { if (unsub) unsub(); };
  }, [uid]);

  const save = useCallback(async (patch: Partial<StudentProfile>) => {
    if (!uid) return;
    await apiUpdate(uid, patch);
  }, [uid]);

  return { profile, loading, save };
};
