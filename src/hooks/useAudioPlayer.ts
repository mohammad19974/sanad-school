// hook لتشغيل/إيقاف ملفات صوت محلية مع looping

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlayerResult {
  /** المسار الحالي قيد التشغيل أو null */
  currentSrc: string | null;
  /** يبدأ صوتاً جديداً ويوقف ما قبله */
  play: (src: string) => Promise<void>;
  stop: () => void;
  /** يبدّل: لو نفس الصوت فيوقف، خلاف ذلك يبدأ الجديد */
  toggle: (src: string) => Promise<void>;
}

export const useAudioPlayer = (): UseAudioPlayerResult => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentSrc(null);
  }, []);

  const play = useCallback(async (src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    setCurrentSrc(src);
    try {
      await audio.play();
    } catch (err) {
      console.warn('[useAudioPlayer] فشل التشغيل:', err);
      setCurrentSrc(null);
    }
  }, []);

  const toggle = useCallback(async (src: string) => {
    if (currentSrc === src) {
      stop();
    } else {
      await play(src);
    }
  }, [currentSrc, play, stop]);

  // تنظيف عند فك التركيب
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return { currentSrc, play, stop, toggle };
};
