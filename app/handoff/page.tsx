'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGameState, setGameState, otherPlayer, playerName } from '@/lib/gameState';
import { GameState } from '@/types';

export default function HandoffPage() {
  const router = useRouter();
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    const s = getGameState();
    if (!s.player1Name) { router.replace('/'); return; }
    setState(s);
  }, [router]);

  function handleReady() {
    if (!state) return;
    const nextPlayer = otherPlayer(state.currentPlayer);
    setGameState({ currentPlayer: nextPlayer, round: 2 });
    router.push('/play');
  }

  if (!state) return null;

  const justFinished = playerName(state, state.currentPlayer);
  const upNext = playerName(state, otherPlayer(state.currentPlayer));

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gray-900 px-6 text-center">
      <div className="max-w-sm w-full flex flex-col items-center gap-8">

        <div className="text-6xl">🤝</div>

        <div>
          <h1 className="text-2xl font-bold text-white leading-snug">
            Great job, {justFinished}!
          </h1>
          <p className="mt-3 text-lg text-gray-300">
            Hand it to <span className="font-bold text-white">{upNext}</span>.
          </p>
          <p className="mt-2 text-sm text-gray-500">No peeking at the screen!</p>
        </div>

        <button
          onClick={handleReady}
          className="w-full py-5 rounded-2xl font-bold text-gray-900 bg-white text-xl
            hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
        >
          I&apos;m Ready
        </button>
      </div>
    </div>
  );
}
