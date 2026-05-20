// مشغّل أصوات الطبيعة — يستخدم useAudioPlayer لتشغيل ملفات mp3 المحلية

import type { FC } from 'react';
import { WaveBar } from '../../ui/WaveBar';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useLanguage } from '../../context/LanguageContext';
import { colors, fontFamily } from '../../theme/tokens';

interface SoundOption {
  ar: string;
  he: string;
  src: string;
}

const SOUNDS: SoundOption[] = [
  { ar: '🌊 أمواج', he: '🌊 גלים',    src: '/sounds/waves.wav' },
  { ar: '🌧️ مطر',   he: '🌧️ גשם',     src: '/sounds/rain.wav' },
  { ar: '🍃 ريح',   he: '🍃 רוח',     src: '/sounds/wind.wav' },
  { ar: '🔥 نار',   he: '🔥 אש',      src: '/sounds/fire.wav' },
  { ar: '🦅 طيور',  he: '🦅 ציפורים', src: '/sounds/birds.wav' },
];

export const NatureSounds: FC = () => {
  const { currentSrc, toggle } = useAudioPlayer();
  const { lang } = useLanguage();
  const playing = currentSrc !== null;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 14, padding: 16,
    }}>
      <div style={{ opacity: playing ? 1 : 0.4, transition: 'opacity 0.3s' }}>
        <WaveBar />
      </div>
      <div style={{ fontSize: 17, color: colors.white, fontFamily, fontWeight: 700 }}>
        {playing
          ? (lang === 'he' ? 'מתנגן...' : 'يعمل صوت...')
          : (lang === 'he' ? 'צלילי טבע מרגיעים' : 'أصوات الطبيعة الهادئة')}
      </div>
      <div style={{
        display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {SOUNDS.map((s) => {
          const active = currentSrc === s.src;
          const label = lang === 'he' ? s.he : s.ar;
          return (
            <button
              key={s.src}
              onClick={() => toggle(s.src)}
              style={{
                padding: '12px 18px', borderRadius: 50,
                background: active ? colors.white : 'rgba(255,255,255,0.18)',
                border: `1.5px solid ${active ? colors.white : 'rgba(255,255,255,0.35)'}`,
                color: active ? colors.primaryDark : colors.white,
                fontSize: 16, fontFamily, fontWeight: 700,
                cursor: 'pointer',
              }}
            >{label}</button>
          );
        })}
      </div>
    </div>
  );
};
