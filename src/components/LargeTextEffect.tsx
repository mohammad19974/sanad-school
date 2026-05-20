// يفعّل/يلغي وضع النصوص الكبيرة على عنصر <html>
// عند تفعيل largeText يضاف class "sanad-large-text" → CSS zoom = 1.15
// يقرأ القيمة من ProfileContext؛ يُستخدم localStorage للضيوف

import { useEffect, type FC } from 'react';
import { useProfileContext } from '../context/ProfileContext';

const STORAGE_KEY = 'sanad-large-text';
const CLASS = 'sanad-large-text';

export const LargeTextEffect: FC = () => {
  const { profile } = useProfileContext();

  useEffect(() => {
    // الأولوية للقيمة من Firestore، ثم localStorage كحقيبة ظهر للضيوف
    const fromProfile = profile?.settings?.largeText;
    const fromLocal = window.localStorage.getItem(STORAGE_KEY) === '1';
    const active = fromProfile ?? fromLocal;

    document.documentElement.classList.toggle(CLASS, active);
    window.localStorage.setItem(STORAGE_KEY, active ? '1' : '0');
  }, [profile?.settings?.largeText]);

  return null;
};
