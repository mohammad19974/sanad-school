// صفحة لعبة الثعبان

import { useRef, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { PillButton } from '../../ui/PillButton';
import { useSnakeGame } from '../../games/snake/useSnakeGame';
import { colors, fontFamily } from '../../theme/tokens';

export const SnakeGamePage: FC = () => {
  const history = useHistory();
  const { canvasRef, score, highScore, gameOver, started, start, go, W, H } = useSnakeGame();
  const swipeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // التحكّم بالسحب
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    const dy = e.changedTouches[0].clientY - swipeRef.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      go(dx > 0 ? 'right' : 'left');
    } else {
      go(dy > 0 ? 'down' : 'up');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#0f1f0f' }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: '#0f1f0f', fontFamily, direction: 'rtl',
          position: 'relative',
        }}>
          {/* رأس */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 16px 12px',
          }}>
            <button
              onClick={() => history.goBack()}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${colors.primary}30`, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="chevL" size={20} color={colors.primaryLight} />
            </button>
            <div style={{ fontSize: 15, fontWeight: 800, color: colors.primaryLight }}>
              لعبة الثعبان 🐍
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.white }}>
              {score} | أعلى: {highScore}
            </div>
          </div>

          {/* اللوحة */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 4px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}>
            <canvas
              ref={canvasRef}
              width={W} height={H}
              style={{
                borderRadius: 14, background: '#1a2e1a',
                maxWidth: '100%', touchAction: 'none',
              }}
            />
          </div>

          {/* غطاء انتهاء اللعبة */}
          {gameOver && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14,
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: colors.white }}>
                انتهت اللعبة!
              </div>
              <div style={{ fontSize: 16, color: colors.primaryLight }}>
                نقاطك: {score}
              </div>
              <PillButton onClick={start}>العب مرة أخرى</PillButton>
            </div>
          )}

          {/* أزرار التحكّم */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '16px 0',
          }}>
            {!started && !gameOver && (
              <PillButton onClick={start}>ابدأ اللعبة</PillButton>
            )}
            {started && !gameOver && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <DirBtn onClick={() => go('up')} arrow="▲" />
                <div style={{ display: 'flex', gap: 6 }}>
                  <DirBtn onClick={() => go('left')} arrow="◀" />
                  <DirBtn onClick={() => go('down')} arrow="▼" />
                  <DirBtn onClick={() => go('right')} arrow="▶" />
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: `${colors.primaryLight}80` }}>
              يمكنك السحب على الشاشة أيضاً
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

interface DirBtnProps { onClick: () => void; arrow: string; }
const DirBtn: FC<DirBtnProps> = ({ onClick, arrow }) => (
  <button
    onMouseDown={onClick}
    onTouchStart={(e) => { e.preventDefault(); onClick(); }}
    style={{
      width: 52, height: 52, borderRadius: 14,
      background: `${colors.primary}30`,
      border: `1.5px solid ${colors.primary}50`,
      fontSize: 22, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: colors.white,
    }}
  >
    {arrow}
  </button>
);
