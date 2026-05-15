// hook التفعيل الصوتي — يستمع بشكل مستمرّ لكلمات الإنذار
// يستخدم Web Speech API (مجاني، مدمج في المتصفّح)
// قائلة "نجدة" أو "ساعدوني" → يطلق callback (عادة فتح SOS modal)

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceStatus = 'idle' | 'listening' | 'denied' | 'unsupported' | 'error';

interface Result {
  status:         VoiceStatus;
  lastTranscript: string;
  /** يبدأ الاستماع — يطلب الإذن لو لزم */
  start: () => Promise<void>;
  /** يوقف الاستماع */
  stop: () => void;
}

// كلمات الإطلاق — عربية + عبرية + إنجليزية
const TRIGGER_WORDS_RAW = [
  // عربي — كل الصيغ الشائعة (ة و ه، أ/ا، إلخ)
  'نجده', 'النجده', 'نجدة', 'النجدة', 'نجدا', 'يا نجده',
  'ساعدوني', 'ساعدني', 'ساعد',
  'انقذوني', 'انقذني', 'انقاذ', 'إنقذوني',
  'الحقوني', 'الحقني', 'الحقو',
  'طوارئ', 'طواري',
  // עברית
  'הצילו', 'עזרה', 'מצוקה', 'אזעקה', 'הצל',
  // English
  'help', 'help me', 'sos', 'emergency', 'rescue',
];

/** يُوحِّد النصّ: إسقاط التشكيل + توحيد ة↔ه ي↔ى أ↔ا + lowercase */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '') // diacritics + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/\s+/g, ' ')
    .trim();
};

const TRIGGERS_NORMALIZED = TRIGGER_WORDS_RAW.map(normalizeText);

// تأخير بين الإطلاقات لمنع الإطلاق المتكرّر
const COOLDOWN_MS = 8000;

// نوع SpeechRecognition عبر المتصفّحات
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend:   (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionResultLike {
  0: { transcript: string; confidence: number };
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: SpeechRecognitionResultLike; length: number; item: (i: number) => SpeechRecognitionResultLike };
  resultIndex: number;
}

const getRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const containsTrigger = (text: string): boolean => {
  const norm = normalizeText(text);
  return TRIGGERS_NORMALIZED.some((w) => norm.includes(w));
};

export const useVoiceTrigger = (
  enabled: boolean,
  onTrigger: () => void,
  lang: string = 'ar',
): Result => {
  const [status, setStatus]         = useState<VoiceStatus>('idle');
  const [lastTranscript, setLast]   = useState('');
  const recogRef                    = useRef<SpeechRecognitionLike | null>(null);
  const restartTimerRef             = useRef<number | null>(null);
  const lastTriggerRef              = useRef<number>(0);
  const wantRunningRef              = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    if (restartTimerRef.current != null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recogRef.current) {
      try { recogRef.current.abort(); } catch { /* noop */ }
      recogRef.current.onresult = null;
      recogRef.current.onerror = null;
      recogRef.current.onend = null;
      recogRef.current.onstart = null;
      recogRef.current = null;
    }
  }, []);

  const buildRecognition = useCallback((): SpeechRecognitionLike | null => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;
    const r = new Ctor();
    r.continuous = true;        // لا يتوقّف بعد كلمة واحدة
    r.interimResults = false;   // النتائج النهائية فقط
    r.lang = lang;              // قابل للتخصيص: ar / he-IL / en
    r.maxAlternatives = 1;

    r.onstart = () => setStatus('listening');

    r.onresult = (e) => {
      const idx = e.results.length - 1;
      const result = e.results[idx];
      if (!result || !result.isFinal) return;
      const transcript = result[0]?.transcript ?? '';
      setLast(transcript);
      if (!transcript) return;

      const normalized = normalizeText(transcript);
      // eslint-disable-next-line no-console
      console.info('[voice] سُمع:', transcript, '→', normalized);

      if (containsTrigger(transcript)) {
        const now = Date.now();
        if (now - lastTriggerRef.current > COOLDOWN_MS) {
          lastTriggerRef.current = now;
          // eslint-disable-next-line no-console
          console.info('[voice] ✅ تم اكتشاف نداء نجدة!');
          try { onTrigger(); } catch (err) {
            console.warn('[useVoiceTrigger] onTrigger threw:', err);
          }
        }
      }
    };

    r.onerror = (ev) => {
      // 'not-allowed' → المستخدم رفض الإذن
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        setStatus('denied');
        wantRunningRef.current = false;
        return;
      }
      // 'no-speech' / 'audio-capture' → نتجاهل ونعيد التشغيل
      if (ev.error === 'no-speech' || ev.error === 'audio-capture' || ev.error === 'network') {
        return;
      }
      console.warn('[useVoiceTrigger] error:', ev.error);
    };

    r.onend = () => {
      // الـ recognition ينهي تلقائياً بعد فترة — أعد التشغيل
      if (wantRunningRef.current) {
        restartTimerRef.current = window.setTimeout(() => {
          try { r.start(); } catch { /* may already be running */ }
        }, 250);
      } else {
        setStatus('idle');
      }
    };

    return r;
  }, [onTrigger, lang]);

  const start = useCallback(async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) { setStatus('unsupported'); return; }

    // اطلب إذن المايكروفون صراحةً (لو لم يُمنح بعد)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus('denied');
      return;
    }

    cleanup();
    const r = buildRecognition();
    if (!r) { setStatus('unsupported'); return; }
    recogRef.current = r;
    wantRunningRef.current = true;
    try {
      r.start();
    } catch (err) {
      console.warn('[useVoiceTrigger] start failed:', err);
      setStatus('error');
    }
  }, [buildRecognition, cleanup]);

  const stop = useCallback(() => {
    wantRunningRef.current = false;
    cleanup();
    setStatus('idle');
  }, [cleanup]);

  // إدارة تلقائية حسب enabled
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return () => stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { status, lastTranscript, start, stop };
};
