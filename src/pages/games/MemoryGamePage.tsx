// صفحة لعبة الذاكرة — شبكة 4×4 من البطاقات

import type { FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { PillButton } from '../../ui/PillButton';
import { useMemoryGame } from '../../games/memory/useMemoryGame';
import { colors, fontFamily } from '../../theme/tokens';

export const MemoryGamePage: FC = () => {
  const history = useHistory();
  const { state, flip, restart } = useMemoryGame();

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.primaryDark }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg,#2E5138 0%,#7DB88A 100%)',
          fontFamily, direction: 'rtl', position: 'relative',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 16px 12px',
          }}>
            <button
              onClick={() => history.goBack()}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="chevL" size={20} color={colors.white} />
            </button>
            <div style={{ fontSize: 15, fontWeight: 800, color: colors.white }}>
              لعبة الذاكرة 🧠
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.white }}>
              حركات: {state.moves}
            </div>
          </div>

          <div style={{
            flex: 1, padding: '12px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: '1fr',
            gap: 10,
            alignContent: 'center',
          }}>
            {state.cards.map((card) => {
              const showing = card.flipped || card.matched;
              return (
                <button
                  key={card.id}
                  onClick={() => flip(card.id)}
                  disabled={showing}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 14, border: 'none',
                    background: showing
                      ? card.matched ? 'rgba(255,255,255,0.35)' : colors.white
                      : 'rgba(255,255,255,0.18)',
                    color: showing ? colors.primaryDark : 'transparent',
                    fontSize: 32, cursor: showing ? 'default' : 'pointer',
                    transition: 'all 0.3s',
                    transform: showing ? 'rotateY(0)' : 'rotateY(0)',
                    boxShadow: card.matched ? `0 0 0 3px ${colors.primaryLight}` : 'none',
                  }}
                >
                  {showing ? card.symbol : '?'}
                </button>
              );
            })}
          </div>

          {state.finished && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: colors.white }}>أحسنت! 🎉</div>
              <div style={{ fontSize: 16, color: colors.primaryLight }}>
                أنهيت اللعبة في {state.moves} حركة
              </div>
              <PillButton onClick={restart} variant="white">العب مرة أخرى</PillButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
