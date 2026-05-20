// مزوّد لغة الواجهة — عربي/عبري
// يقرأ القيمة من ProfileContext.settings.lang أولاً، ثم localStorage للضيوف
// يكتب القيمة على <html lang="..."> و <html dir="..."> (كلاهما RTL)

import { createContext, useContext, useEffect, useMemo, useCallback, type FC, type ReactNode } from 'react';
import { useProfileContext } from './ProfileContext';
import { translate, type TranslationKey } from '../i18n/translations';
import type { AppLang } from '../types/profile';

const STORAGE_KEY = 'sanad-lang';

interface LanguageCtx {
  lang: AppLang;
  setLang: (l: AppLang) => Promise<void>;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageCtx>({
  lang: 'ar',
  setLang: async () => { /* noop */ },
  t: (key) => key,
});

const detectInitial = (): AppLang => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'he' || stored === 'ar') return stored;
  return 'ar';
};

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, save } = useProfileContext();

  // الأولوية: profile.settings.lang ← localStorage ← 'ar'
  const lang: AppLang = profile?.settings?.lang ?? detectInitial();

  // طبّق اللغة على <html> وخزّنها محلياً
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', 'rtl'); // كلاهما RTL
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback(async (l: AppLang) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.setAttribute('lang', l);
    if (profile) {
      try {
        await save({ settings: { ...profile.settings, lang: l } });
      } catch (err) {
        console.error('[lang] فشل حفظ اللغة:', err);
      }
    }
  }, [profile, save]);

  const t = useCallback((key: TranslationKey) => translate(key, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageCtx => useContext(LanguageContext);
