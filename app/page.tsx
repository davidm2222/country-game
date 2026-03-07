'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearGameState, setGameState } from '@/lib/gameState';

export default function StartPage() {
  const router = useRouter();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  useEffect(() => {
    // Clear any previous game state on the start screen
    clearGameState();
  }, []);

  const canStart = player1.trim().length > 0 && player2.trim().length > 0;

  function handleStart() {
    if (!canStart) return;
    setGameState({
      player1Name: player1.trim(),
      player2Name: player2.trim(),
      player1Countries: [],
      player2Countries: [],
      currentPlayer: 1,
      round: 1,
      firstPlayer: 1,
    });
    router.push('/play');
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Country Name Battle
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Who can name more countries?
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player 1 Name
            </label>
            <input
              type="text"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={player1}
              onChange={e => setPlayer1(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') document.getElementById('p2-input')?.focus(); }}
              placeholder="e.g. Alice"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player 2 Name
            </label>
            <input
              id="p2-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={player2}
              onChange={e => setPlayer2(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleStart(); }}
              placeholder="e.g. Bob"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="mt-2 w-full py-4 rounded-xl font-semibold text-white text-lg transition-all
              bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
              hover:bg-blue-700 active:scale-95"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
