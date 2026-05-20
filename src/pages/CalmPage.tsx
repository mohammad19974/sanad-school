// صفحة التهدئة — 4 تابات: تنفس، رسائل، أصوات، ألعاب

import { useState, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { BreathingExercise } from '../components/calm/BreathingExercise';
import { CalmMessages } from '../components/calm/CalmMessages';
import { NatureSounds } from '../components/calm/NatureSounds';
import { Icon } from '../ui/Icon';
import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/translations';
import { colors, fontFamily } from '../theme/tokens';

type Tab = 'breath' | 'messages' | 'sound' | 'games';

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: 'breath',   labelKey: 'calm.tab.breath' },
  { id: 'messages', labelKey: 'calm.tab.messages' },
  { id: 'sound',    labelKey: 'calm.tab.sounds' },
  { id: 'games',    labelKey: 'calm.tab.games' },
];

export const CalmPage: FC = () => {
  const [tab, setTab] = useState<Tab>('breath');
  const history = useHistory();
  const { t } = useLanguage();

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.primaryDark }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg,#2E5138 0%,#7DB88A 100%)',
          fontFamily, direction: 'rtl',
        }}>
          <div style={{ padding: '20px 20px 6px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: colors.white }}>{t('calm.title')}</div>
            <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{t('calm.subtitle')}</div>
          </div>

          {/* تابات */}
          <div style={{
            display: 'flex', margin: '0 16px 10px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 12, padding: 3,
          }}>
            {TABS.map((it) => (
              <button
                key={it.id}
                onClick={() => setTab(it.id)}
                style={{
                  flex: 1, padding: '10px 2px', borderRadius: 10,
                  border: 'none', cursor: 'pointer',
                  background: tab === it.id ? colors.white : 'transparent',
                  color: tab === it.id ? colors.primaryDark : 'rgba(255,255,255,0.85)',
                  fontSize: 15, fontWeight: 700, fontFamily,
                  transition: 'all 0.2s',
                }}
              >{t(it.labelKey)}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {tab === 'breath'   && <BreathingExercise />}
            {tab === 'messages' && <CalmMessages />}
            {tab === 'sound'    && <NatureSounds />}
            {tab === 'games' && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: 16, padding: 24, alignItems: 'stretch',
              }}>
                <button
                  onClick={() => history.push('/games/snake')}
                  style={{
                    padding: 18, borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.15)', color: colors.white,
                    display: 'flex', alignItems: 'center', gap: 14,
                    fontFamily,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="snake" size={28} color={colors.white} />
                  </div>
                  <div style={{ textAlign: 'right', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>🐍 {t('calm.game.snake')}</div>
                    <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>{t('calm.game.snake.desc')}</div>
                  </div>
                </button>

                <button
                  onClick={() => history.push('/games/memory')}
                  style={{
                    padding: 18, borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.15)', color: colors.white,
                    display: 'flex', alignItems: 'center', gap: 14,
                    fontFamily,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="memory" size={28} color={colors.white} />
                  </div>
                  <div style={{ textAlign: 'right', flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>🧠 {t('calm.game.memory')}</div>
                    <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>{t('calm.game.memory.desc')}</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
