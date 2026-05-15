// hook لإدارة سجل رسائل SMS محلياً عبر localStorage
// يحفظ آخر 50 رسالة، يدعم الإضافة والحذف

import { useCallback, useEffect, useState } from 'react';
import type { SmsLogEntry } from '../types';

const KEY = 'sanad.smsLog.v1';
const MAX_ENTRIES = 50;

const readAll = (): SmsLogEntry[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SmsLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (entries: SmsLogEntry[]): void => {
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* quota */ }
};

interface Result {
  entries: SmsLogEntry[];
  add: (entry: Omit<SmsLogEntry, 'id' | 'createdAt'>) => SmsLogEntry;
  clear: () => void;
  remove: (id: string) => void;
}

export const useSmsLog = (): Result => {
  const [entries, setEntries] = useState<SmsLogEntry[]>(() => readAll());

  // مزامنة عبر tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setEntries(readAll());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((data: Omit<SmsLogEntry, 'id' | 'createdAt'>): SmsLogEntry => {
    const entry: SmsLogEntry = {
      ...data,
      id: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    setEntries((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      writeAll(next);
      return next;
    });
    return entry;
  }, []);

  const remove = useCallback((id: string): void => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeAll(next);
      return next;
    });
  }, []);

  const clear = useCallback((): void => {
    setEntries([]);
    writeAll([]);
  }, []);

  return { entries, add, clear, remove };
};
