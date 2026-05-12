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
  // مهم: عند تغيّر uid (مثلاً بعد login) يجب إعادة loading=true لمنع
  // الـ guards من إرجاع مسار خاطئ قبل وصول البيانات
  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setProfile(null);
    setLoading(true);

    let unsub: (() => void) | null = null;
    let cancelled = false;

    getOrCreateProfile(uid)
      .then(() => {
        if (cancelled) return;
        unsub = watchProfile(uid, (p) => {
          setProfile(p);
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error('[useProfile] فشل جلب الملف:', err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [uid]);

  const save = useCallback(async (patch: Partial<StudentProfile>) => {
    if (!uid) return;
    await apiUpdate(uid, patch);
  }, [uid]);

  return { profile, loading, save };
};
