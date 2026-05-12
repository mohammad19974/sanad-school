// صفحة لعبة الثعبان — تصميم احترافي مع HUD، إيقاف، عدّ تنازلي

import { useRef, type FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { PillButton } from '../../ui/PillButton';
import { useSnakeGame } from '../../games/snake/useSnakeGame';
import { speedPercentFor } from '../../games/snake/snakeEngine';
import { colors, fontFamily } from '../../theme/tokens';

export const SnakeGamePage: FC = () => {
  const history = useHistory();
  const game = useSnakeGame();
  const swipeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ─── تحكّم بالسحب ─────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
    const dy = e.changedTouches[0].clientY - swipeRef.current.y;
    // تجاهل اللمسات القصيرة جداً
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      game.go(dx > 0 ? 'right' : 'left');
    } else {
      game.go(dy > 0 ? 'down' : 'up');
    }
  };

  // ─── سرعة الحركة كنسبة مئوية للعرض ─────────────────
  // كلّما قلّ tickMs زادت السرعة (دالة من الثوابت في snakeEngine)
  const speedPercent = speedPercentFor(game.speedMs);

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#0f1f0f' }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: '#0f1f0f', fontFamily, direction: 'rtl',
          position: 'relative',
        }}>
          {/* ─── شريط علوي ─── */}
          <TopBar
            onBack={() => history.goBack()}
            status={game.status}
            onPauseToggle={game.togglePause}
          />

          {/* ─── HUD: النقاط / المستوى / السرعة / الأعلى ─── */}
          <HudBar
            score={game.score}
            level={game.level}
            speedPercent={speedPercent}
            highScore={game.highScore}
          />

          {/* ─── لوحة اللعبة ─── */}
          <div
            style={{
              display: 'flex', justifyContent: 'center',
              padding: '8px 4px', position: 'relative',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={game.canvasRef}
              width={game.W} height={game.H}
              style={{
                borderRadius: 16, background: '#0f1f0f',
                maxWidth: '100%', touchAction: 'none',
                boxShadow: `0 8px 24px ${colors.pulse}`,
              }}
            />
            {/* عدّ تنازلي فوق اللوحة */}
            {game.status === 'countdown' && (
              <CountdownOverlay value={game.countdownValue} />
            )}
            {/* إيقاف مؤقّت */}
            {game.status === 'paused' && (
              <PauseOverlay onResume={game.resume} />
            )}
          </div>

          {/* ─── منطقة التحكّم ─── */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 14, padding: '14px 0',
          }}>
            {game.status === 'idle' && <StartHero onStart={game.start} />}
            {game.status === 'playing' && <DirPad onGo={game.go} />}
            {game.status === 'paused' && (
              <div style={{ fontSize: 13, color: `${colors.primaryLight}80`, fontFamily }}>
                مساحة أو P لاستئناف اللعبة
              </div>
            )}
            {game.status === 'gameOver' && (
              <GameOverPanel
                score={game.score}
                level={game.level}
                isHighScore={game.newHighScore}
                onRestart={game.start}
              />
            )}
            {(game.status === 'playing' || game.status === 'paused') && (
              <div style={{ fontSize: 11, color: `${colors.primaryLight}80`, fontFamily }}>
                اسحب على الشاشة • الأسهم • P للإيقاف
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─────────────────────────────────────────────────
// مكوّنات داخلية
// ─────────────────────────────────────────────────

interface TopBarProps {
  onBack: () => void;
  status: string;
  onPauseToggle: () => void;
}
const TopBar: FC<TopBarProps> = ({ onBack, status, onPauseToggle }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 16px 8px',
  }}>
    <button
      onClick={onBack}
      style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${colors.primary}30`, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name="chevL" size={20} color={colors.primaryLight} />
    </button>
    <div style={{
      fontSize: 16, fontWeight: 800, color: colors.primaryLight, fontFamily,
    }}>
      🐍 لعبة الثعبان
    </div>
    {status === 'playing' || status === 'paused' ? (
      <button
        onClick={onPauseToggle}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${colors.primary}30`, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.primaryLight, fontSize: 16, fontFamily,
        }}
      >
        {status === 'paused' ? '▶' : '⏸'}
      </button>
    ) : (
      <div style={{ width: 36 }} />
    )}
  </div>
);

interface HudProps {
  score: number;
  level: number;
  speedPercent: number;
  highScore: number;
}
const HudBar: FC<HudProps> = ({ score, level, speedPercent, highScore }) => (
  <div style={{
    display: 'flex', gap: 8, padding: '0 16px 6px', fontFamily,
  }}>
    <HudChip label="النقاط"  value={String(score)}        accent />
    <HudChip label="المستوى" value={String(level)} />
    <HudChip label="السرعة"  value={`${speedPercent}%`} />
    <HudChip label="الأعلى"  value={String(highScore)} />
  </div>
);

const HudChip: FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div style={{
    flex: 1, padding: '8px 6px', borderRadius: 12,
    background: accent ? `${colors.primary}40` : `${colors.primary}1A`,
    border: `1px solid ${colors.primary}40`,
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 9, color: `${colors.primaryLight}aa`, fontFamily }}>{label}</div>
    <div style={{
      fontSize: 16, fontWeight: 800,
      color: accent ? '#fff' : colors.primaryLight, fontFamily,
    }}>{value}</div>
  </div>
);

const CountdownOverlay: FC<{ value: number }> = ({ value }) => (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, pointerEvents: 'none',
  }}>
    <div style={{
      fontSize: 100, fontWeight: 800, color: '#fff',
      fontFamily, textShadow: '0 4px 30px rgba(0,0,0,0.8)',
      animation: 'breathe 0.7s ease-in-out',
    }}>
      {value > 0 ? value : 'هيا!'}
    </div>
  </div>
);

const PauseOverlay: FC<{ onResume: () => void }> = ({ onResume }) => (
  <div
    onClick={onResume}
    style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      borderRadius: 16, cursor: 'pointer',
    }}
  >
    <div style={{ fontSize: 60 }}>⏸</div>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily }}>
      اللعبة متوقفة
    </div>
    <div style={{ fontSize: 12, color: colors.primaryLight, fontFamily }}>
      انقر للمتابعة
    </div>
  </div>
);

const StartHero: FC<{ onStart: () => void }> = ({ onStart }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 12, padding: '0 24px',
  }}>
    <div style={{ fontSize: 13, color: colors.primaryLight, fontFamily, textAlign: 'center' }}>
      تبدأ بطيئة وتسرع كلّما أكلت • أوّل مستوى مريح • تحكّم بالأسهم أو السحب
    </div>
    <PillButton onClick={onStart}>ابدأ اللعبة</PillButton>
  </div>
);

interface GameOverProps {
  score: number;
  level: number;
  isHighScore: boolean;
  onRestart: () => void;
}
const GameOverPanel: FC<GameOverProps> = ({ score, level, isHighScore, onRestart }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10, padding: '8px 24px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily }}>
      {isHighScore ? '🏆 رقم قياسي جديد!' : 'انتهت اللعبة'}
    </div>
    <div style={{ fontSize: 14, color: colors.primaryLight, fontFamily }}>
      نقاطك: <b style={{ color: '#fff' }}>{score}</b> • وصلت للمستوى <b style={{ color: '#fff' }}>{level}</b>
    </div>
    <PillButton onClick={onRestart}>العب مرّة أخرى</PillButton>
  </div>
);

interface DirPadProps { onGo: (d: 'up' | 'down' | 'left' | 'right') => void; }
const DirPad: FC<DirPadProps> = ({ onGo }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6,
    direction: 'ltr', // الألعاب لا تتأثّر بـ RTL
  }}>
    <DirBtn onClick={() => onGo('up')} arrow="▲" />
    <div style={{ display: 'flex', gap: 6 }}>
      <DirBtn onClick={() => onGo('left')} arrow="◀" />
      <DirBtn onClick={() => onGo('down')} arrow="▼" />
      <DirBtn onClick={() => onGo('right')} arrow="▶" />
    </div>
  </div>
);

interface DirBtnProps { onClick: () => void; arrow: string; }
const DirBtn: FC<DirBtnProps> = ({ onClick, arrow }) => (
  <button
    onMouseDown={onClick}
    onTouchStart={(e) => { e.preventDefault(); onClick(); }}
    style={{
      width: 56, height: 56, borderRadius: 16,
      background: `${colors.primary}40`,
      border: `1.5px solid ${colors.primary}60`,
      fontSize: 22, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: colors.white,
      transition: 'all 0.1s',
    }}
    onTouchEnd={(e) => e.preventDefault()}
  >
    {arrow}
  </button>
);
