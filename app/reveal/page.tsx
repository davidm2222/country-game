'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getGameState, setGameState, otherPlayer, clearGameState } from '@/lib/gameState';
import { COUNTRIES } from '@/lib/countries';
import { GameState } from '@/types';

// Load WorldMap client-side only (react-simple-maps uses browser APIs)
const WorldMap = dynamic(() => import('@/components/features/WorldMap'), { ssr: false });

export default function RevealPage() {
  const router = useRouter();
  const [state, setState] = useState<GameState | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('both');

  useEffect(() => {
    const s = getGameState();
    if (!s.player1Name) { router.replace('/'); return; }
    setState(s);
  }, [router]);

  if (!state) return null;

  const { player1Name: p1, player2Name: p2, player1Countries: p1c, player2Countries: p2c } = state;

  const p1Set = new Set(p1c);
  const p2Set = new Set(p2c);

  const bothList = p1c.filter(c => p2Set.has(c)).sort();
  const onlyP1 = p1c.filter(c => !p2Set.has(c)).sort();
  const onlyP2 = p2c.filter(c => !p1Set.has(c)).sort();

  const allCountries = state.continent
    ? COUNTRIES.filter(c => c.continent === state.continent)
    : COUNTRIES;
  const neitherList = allCountries
    .map(c => c.name)
    .filter(n => !p1Set.has(n) && !p2Set.has(n))
    .sort();

  const p1Score = p1c.length;
  const p2Score = p2c.length;
  const winner = p1Score > p2Score ? p1 : p2Score > p1Score ? p2 : null;
  const p1Wins = p1Score > p2Score;

  function handleRematch() {
    const newFirst = otherPlayer(state!.firstPlayer);
    setGameState({
      player1Countries: [],
      player2Countries: [],
      currentPlayer: newFirst,
      round: 1,
      firstPlayer: newFirst,
      // mode, timerSeconds, continent carry over automatically via setGameState merge
    });
    router.push('/play');
  }

  function handleNewGame() {
    clearGameState();
    router.push('/');
  }

  function toggleSection(id: string) {
    setOpenSection(prev => prev === id ? null : id);
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Winner banner */}
      <div className="px-6 pt-8 pb-6 text-center bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        {winner ? (
          <>
            <div className="text-4xl mb-2">🏆</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {winner} wins!
            </h1>
            <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">
              <span className={p1Wins ? 'font-bold text-blue-600' : ''}>{p1Score}</span>
              {' '}vs{' '}
              <span className={!p1Wins ? 'font-bold text-orange-600' : ''}>{p2Score}</span>
              {' '}countries
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">🤝</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">It&apos;s a tie!</h1>
            <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">{p1Score} countries each</p>
          </>
        )}
      </div>

      {/* Score cards — full width on mobile, constrained on desktop */}
      <div className="flex gap-3 px-4 pt-4 max-w-lg mx-auto md:max-w-5xl">
        <ScoreCard name={p1} score={p1Score} color="blue" isWinner={p1Score > p2Score} />
        <ScoreCard name={p2} score={p2Score} color="orange" isWinner={p2Score > p1Score} />
      </div>

      {/* Two-column layout on desktop */}
      <div className="mt-4 px-4 max-w-5xl mx-auto md:flex md:gap-4 md:items-start">

        {/* Left col: map */}
        <div className="md:flex-[3] bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <WorldMap p1Countries={p1c} p2Countries={p2c} p1Name={p1} p2Name={p2} continent={state.continent} />
        </div>

        {/* Right col: breakdown + buttons */}
        <div className="md:flex-[2] mt-4 md:mt-0 space-y-2">
          <BreakdownSection
            id="both"
            title={`Both named`}
            count={bothList.length}
            countries={bothList}
            color="green"
            isOpen={openSection === 'both'}
            onToggle={() => toggleSection('both')}
          />
          <BreakdownSection
            id="p1"
            title={`Only ${p1}`}
            count={onlyP1.length}
            countries={onlyP1}
            color="blue"
            isOpen={openSection === 'p1'}
            onToggle={() => toggleSection('p1')}
          />
          <BreakdownSection
            id="p2"
            title={`Only ${p2}`}
            count={onlyP2.length}
            countries={onlyP2}
            color="orange"
            isOpen={openSection === 'p2'}
            onToggle={() => toggleSection('p2')}
          />
          <BreakdownSection
            id="neither"
            title="Neither named"
            count={neitherList.length}
            countries={neitherList}
            color="gray"
            isOpen={openSection === 'neither'}
            onToggle={() => toggleSection('neither')}
          />

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleRematch}
              className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-lg"
            >
              Rematch ({p2} goes first)
            </button>
            <button
              onClick={handleNewGame}
              className="w-full py-4 rounded-xl font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all text-lg"
            >
              New Game
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function ScoreCard({
  name,
  score,
  color,
  isWinner,
}: {
  name: string;
  score: number;
  color: 'blue' | 'orange';
  isWinner: boolean;
}) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600',
    orange: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-600',
  };
  return (
    <div className={`flex-1 rounded-xl border-2 p-4 text-center ${colorMap[color]} ${isWinner ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
      <p className="text-xs font-medium text-current opacity-70 truncate">{name}</p>
      <p className="text-4xl font-bold mt-1">{score}</p>
      <p className="text-xs opacity-60 mt-0.5">countries</p>
    </div>
  );
}

function BreakdownSection({
  id,
  title,
  count,
  countries,
  color,
  isOpen,
  onToggle,
}: {
  id: string;
  title: string;
  count: number;
  countries: string[];
  color: 'blue' | 'orange' | 'green' | 'gray';
  isOpen: boolean;
  onToggle: () => void;
}) {
  const dotColor = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    gray: 'bg-gray-400',
  }[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
          <span className="text-sm text-gray-400">{`(${count})`}</span>
        </div>
        <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-700">
          {count === 0 ? (
            <p className="text-sm text-gray-400 pt-3">None</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-3">
              {countries.map(c => (
                <span key={c} className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-lg">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
