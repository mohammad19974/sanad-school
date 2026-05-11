// مشغّل أصوات الطبيعة — يستخدم useAudioPlayer لتشغيل ملفات mp3 المحلية

import type { FC } from 'react';
import { WaveBar } from '../../ui/WaveBar';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { colors, fontFamily } from '../../theme/tokens';

interface SoundOption {
  label: string;
  src: string;
}

const SOUNDS: SoundOption[] = [
  { label: '🌊 أمواج', src: '/sounds/waves.mp3' },
  { label: '🌧️ مطر',   src: '/sounds/rain.mp3' },
  { label: '🍃 ريح',   src: '/sounds/wind.mp3' },
  { label: '🔥 نار',   src: '/sounds/fire.mp3' },
  { label: '🦅 طيور',  src: '/sounds/birds.mp3' },
];

export const NatureSounds: FC = () => {
  const { currentSrc, toggle } = useAudioPlayer();
  const playing = currentSrc !== null;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 14, padding: 16,
    }}>
      <div style={{ opacity: playing ? 1 : 0.4, transition: 'opacity 0.3s' }}>
        <WaveBar />
      </div>
      <div style={{ fontSize: 14, color: colors.white, fontFamily, fontWeight: 600 }}>
        {playing ? 'يعمل صوت...' : 'أصوات الطبيعة الهادئة'}
      </div>
      <div style={{
        display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {SOUNDS.map((s) => {
          const active = currentSrc === s.src;
          return (
            <button
              key={s.label}
              onClick={() => toggle(s.src)}
              style={{
                padding: '10px 14px', borderRadius: 50,
                background: active ? colors.white : 'rgba(255,255,255,0.18)',
                border: `1.5px solid ${active ? colors.white : 'rgba(255,255,255,0.35)'}`,
                color: active ? colors.primaryDark : colors.white,
                fontSize: 13, fontFamily, fontWeight: 600,
                cursor: 'pointer',
              }}
            >{s.label}</button>
          );
        })}
      </div>
    </div>
  );
};
