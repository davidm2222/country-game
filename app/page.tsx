'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearGameState, setGameState } from '@/lib/gameState';
import { Continent, GameMode } from '@/types';

const TIMER_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

const CONTINENT_OPTIONS: { label: string; value: Continent }[] = [
  { label: 'Africa', value: 'Africa' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'N & C America', value: 'North America' },
  { label: 'S America & Caribbean', value: 'South America' },
  { label: 'Oceania', value: 'Oceania' },
];

export default function StartPage() {
  const router = useRouter();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [mode, setMode] = useState<GameMode>('classic');
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [continent, setContinent] = useState<Continent | null>(null);

  useEffect(() => {
    clearGameState();
  }, []);

  const canStart =
    player1.trim().length > 0 &&
    player2.trim().length > 0 &&
    (mode !== 'continent' || continent !== null);

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
      mode,
      ...(mode === 'timed' && { timerSeconds }),
      ...(mode === 'continent' && continent && { continent }),
    });
    router.push('/play');
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Country Name Battle
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
            Who can name more countries?
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              onKeyDown={e => { if (e.key === 'Enter' && mode !== 'continent') handleStart(); }}
              placeholder="e.g. Bob"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['classic', 'timed', 'continent'] as GameMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize
                    ${mode === m
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-900 dark:border-blue-400'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}
                >
                  {m === 'continent' ? 'Continent' : m === 'timed' ? 'Timed' : 'Classic'}
                </button>
              ))}
            </div>
          </div>

          {/* Timer options */}
          {mode === 'timed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time per player
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_OPTIONS.map(opt => (
                  <button
                    key={opt.seconds}
                    type="button"
                    onClick={() => setTimerSeconds(opt.seconds)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all
                      ${timerSeconds === opt.seconds
                        ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-900 dark:border-blue-400'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continent options */}
          {mode === 'continent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Continent
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTINENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setContinent(opt.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left
                      ${continent === opt.value
                        ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-900 dark:border-blue-400'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
