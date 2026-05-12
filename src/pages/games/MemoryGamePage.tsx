// صفحة لعبة الذاكرة — تصميم احترافي مع 3D flip ومرحلة معاينة

import type { FC } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../../ui/Icon';
import { PillButton } from '../../ui/PillButton';
import { useMemoryGame } from '../../games/memory/useMemoryGame';
import type { MemoryCard } from '../../games/memory/memoryEngine';
import { colors, fontFamily } from '../../theme/tokens';

export const MemoryGamePage: FC = () => {
  const history = useHistory();
  const game = useMemoryGame();
  const { state } = game;

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': colors.primaryDark }}>
        <div style={{
          minHeight: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg,#2E5138 0%,#7DB88A 100%)',
          fontFamily, direction: 'rtl', position: 'relative',
        }}>
          {/* ─── شريط علوي ─── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 16px 8px',
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
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.white }}>
              🧠 لعبة الذاكرة
            </div>
            <button
              onClick={game.restart}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.white, fontSize: 18,
              }}
              title="إعادة"
            >↻</button>
          </div>

          {/* ─── HUD: حركات / وقت / أزواج / أفضل ─── */}
          <HudBar
            moves={state.moves}
            seconds={game.elapsedSec}
            matches={state.matches}
            best={game.best}
          />

          {/* ─── رسالة المرحلة ─── */}
          <PhaseMessage
            status={state.status}
            previewRemaining={game.previewRemaining}
          />

          {/* ─── شبكة البطاقات ─── */}
          <div style={{
            flex: 1, padding: '8px 16px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            alignContent: 'center',
          }}>
            {state.cards.map((card) => (
              <Card3D
                key={card.id}
                card={card}
                onFlip={game.flip}
              />
            ))}
          </div>

          {/* ─── شاشة الفوز ─── */}
          {state.status === 'finished' && (
            <WinPanel
              moves={state.moves}
              seconds={game.elapsedSec}
              isNewBest={game.isNewBest}
              onRestart={game.restart}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

// ─────────────────────────────────────────────────
// المكوّنات المساعدة
// ─────────────────────────────────────────────────

interface HudProps {
  moves: number;
  seconds: number;
  matches: number;
  best: { moves: number; seconds: number } | null;
}
const HudBar: FC<HudProps> = ({ moves, seconds, matches, best }) => (
  <div style={{ display: 'flex', gap: 8, padding: '0 16px 6px', fontFamily }}>
    <HudChip label="حركات" value={String(moves)} accent />
    <HudChip label="الزمن" value={formatTime(seconds)} />
    <HudChip label="أزواج" value={`${matches}/8`} />
    <HudChip
      label="أفضل"
      value={best ? `${best.moves}·${formatTime(best.seconds)}` : '—'}
    />
  </div>
);

const HudChip: FC<{ label: string; value: string; accent?: boolean }> = ({
  label, value, accent,
}) => (
  <div style={{
    flex: 1, padding: '8px 6px', borderRadius: 12,
    background: accent ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.20)',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontFamily }}>{label}</div>
    <div style={{
      fontSize: 15, fontWeight: 800,
      color: '#fff', fontFamily,
    }}>{value}</div>
  </div>
);

interface PhaseProps { status: string; previewRemaining: number; }
const PhaseMessage: FC<PhaseProps> = ({ status, previewRemaining }) => {
  if (status === 'preview') {
    return (
      <div style={{
        padding: '10px 16px', textAlign: 'center', fontFamily,
        color: colors.white, fontSize: 13, fontWeight: 600,
      }}>
        🔍 احفظ مواضع البطاقات — {previewRemaining} ث
      </div>
    );
  }
  if (status === 'playing') {
    return (
      <div style={{
        padding: '10px 16px', textAlign: 'center', fontFamily,
        color: 'rgba(255,255,255,0.8)', fontSize: 12,
      }}>
        ابحث عن البطاقات المتطابقة
      </div>
    );
  }
  return <div style={{ padding: '10px 16px' }} />;
};

interface Card3DProps {
  card: MemoryCard;
  onFlip: (id: number) => void;
}
const Card3D: FC<Card3DProps> = ({ card, onFlip }) => {
  const isShowing = card.flipped || card.matched;

  return (
    <button
      onClick={() => onFlip(card.id)}
      disabled={isShowing}
      style={{
        aspectRatio: '1 / 1',
        position: 'relative',
        border: 'none', cursor: isShowing ? 'default' : 'pointer',
        background: 'transparent',
        perspective: 800,
        padding: 0,
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s',
        transform: isShowing ? 'rotateY(180deg)' : 'rotateY(0)',
      }}>
        {/* الوجه الخلفي */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          backfaceVisibility: 'hidden',
          background: 'rgba(255,255,255,0.15)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, color: 'rgba(255,255,255,0.4)',
        }}>?</div>

        {/* الوجه الأمامي */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: card.matched
            ? `linear-gradient(135deg, ${colors.primaryLight}, ${colors.white})`
            : colors.white,
          boxShadow: card.matched
            ? `0 0 0 3px ${colors.primaryLight}, 0 4px 14px ${colors.pulse}`
            : '0 4px 14px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>{card.symbol}</div>
      </div>
    </button>
  );
};

interface WinProps {
  moves: number;
  seconds: number;
  isNewBest: boolean;
  onRestart: () => void;
}
const WinPanel: FC<WinProps> = ({ moves, seconds, isNewBest, onRestart }) => (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    padding: 24, textAlign: 'center',
  }}>
    <div style={{ fontSize: 60 }}>{isNewBest ? '🏆' : '🎉'}</div>
    <div style={{
      fontSize: 24, fontWeight: 800, color: colors.white, fontFamily,
    }}>
      {isNewBest ? 'رقم قياسي جديد!' : 'أحسنت!'}
    </div>
    <div style={{ fontSize: 14, color: colors.primaryLight, fontFamily }}>
      أنهيت في <b style={{ color: colors.white }}>{moves}</b> حركة
      {' و '}
      <b style={{ color: colors.white }}>{formatTime(seconds)}</b>
    </div>
    <PillButton onClick={onRestart} variant="white">العب مرّة أخرى</PillButton>
  </div>
);

// ─── أدوات ──────────────────────────────────────────

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
