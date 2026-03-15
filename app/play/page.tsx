'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getGameState, setGameState, playerName, playerCountries } from '@/lib/gameState';
import { matchCountry } from '@/lib/matcher';
import { GameState, MatchResult } from '@/types';

const WorldMap = dynamic(() => import('@/components/features/WorldMap'), { ssr: false });

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<GameState | null>(null);
  const [input, setInput] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<MatchResult | null>(null);
  const [highlightDup, setHighlightDup] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [mapOverlayOpen, setMapOverlayOpen] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDoneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const s = getGameState();
    if (!s.player1Name) { router.replace('/'); return; }
    setState(s);
    setCountries(playerCountries(s, s.currentPlayer));
    if (s.mode === 'timed' && s.timerSeconds) {
      setTimeLeft(s.timerSeconds);
    }
    inputRef.current?.focus();
  }, [router]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  }, []);

  const showFeedback = useCallback((result: MatchResult) => {
    setFeedback(result);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2000);
  }, []);

  // Timer countdown — auto-ends turn when it hits 0
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft === 0) {
      handleDoneRef.current?.();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => (t !== null ? t - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const continent = state?.mode === 'continent' ? state.continent : undefined;
    const result = matchCountry(trimmed, countries, continent);

    if (result.type === 'exact') {
      const updated = [result.country.name, ...countries];
      setCountries(updated);
      setInput('');
      setFeedback(null);
    } else if (result.type === 'duplicate') {
      setHighlightDup(result.country.name);
      setTimeout(() => setHighlightDup(null), 1500);
      setInput('');
      setFeedback(null);
      triggerShake();
    } else {
      showFeedback(result);
      triggerShake();
    }
  }

  const handleDone = useCallback(() => {
    if (!state) return;
    const { currentPlayer, round } = state;

    const patch = currentPlayer === 1
      ? { player1Countries: countries }
      : { player2Countries: countries };

    if (round === 1) {
      setGameState({ ...patch });
      router.push('/handoff');
    } else {
      setGameState({ ...patch });
      router.push('/reveal');
    }
  }, [state, countries, router]);

  useEffect(() => {
    handleDoneRef.current = handleDone;
  }, [handleDone]);

  if (!state) return null;

  const name = playerName(state, state.currentPlayer);
  const mapContinent = state.mode === 'continent' ? state.continent : undefined;

  const inputPanel = (
    <>
      {/* Input area */}
      <div className="flex-none px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700 max-w-lg mx-auto w-full">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            value={input}
            onChange={e => { setInput(e.target.value); setFeedback(null); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Type a country…"
            className={`flex-1 border rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${shaking ? 'shake border-red-400' : 'border-gray-300 dark:border-gray-600'}
              ${feedback?.type === 'none' ? 'border-red-400 bg-red-50 dark:bg-red-900/30' : ''}`}
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            Add
          </button>
        </div>

        <div className="mt-2 min-h-[2rem]">
          {feedback?.type === 'none' && (
            <p className="text-sm text-red-500">Not recognized — try again</p>
          )}
          {feedback?.type === 'out_of_scope' && (
            <p className="text-sm text-orange-500">
              {feedback.country.name} is in {feedback.country.continent}, not {state.continent}
            </p>
          )}
        </div>
      </div>

      {/* Country list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 max-w-lg mx-auto w-full">
        {countries.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">
            Start typing to add countries
          </p>
        ) : (
          <ul className="space-y-1">
            {countries.map((c, i) => (
              <li
                key={c}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${highlightDup === c
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    : 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}
              >
                <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{i + 1}</span>
                <span className="font-medium">{c}</span>
                {highlightDup === c && (
                  <span className="ml-auto text-xs text-yellow-600">already added</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Done button */}
      <div className="flex-none px-4 py-4 border-t border-gray-100 dark:border-gray-700 max-w-lg mx-auto w-full bg-white dark:bg-gray-900">
        <button
          onClick={() => handleDone()}
          className="w-full py-4 rounded-xl font-semibold text-white bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all text-lg"
        >
          I&apos;m Done ({countries.length} {countries.length === 1 ? 'country' : 'countries'})
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh md:h-dvh flex flex-col bg-white dark:bg-gray-900">
      {/* Mobile map overlay */}
      {state.mapMode && mapOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col md:hidden">
          <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="font-semibold text-gray-900 dark:text-white">
              {name}&apos;s Map · {countries.length} named
            </span>
            <button
              onClick={() => { setMapOverlayOpen(false); inputRef.current?.focus(); }}
              className="text-gray-500 dark:text-gray-400 text-2xl leading-none px-1"
              aria-label="Close map"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 flex items-center p-4 overflow-hidden">
            <WorldMap
              p1Countries={countries}
              p2Countries={[]}
              p1Name={name}
              p2Name=""
              continent={mapContinent}
              variant="play"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto md:max-w-none">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
              Round {state.round} of 2
              {state.mode === 'continent' && state.continent && (
                <span className="ml-2 text-blue-500">· {state.continent}</span>
              )}
            </p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {name}&apos;s Turn
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <span className={`text-xl font-bold tabular-nums ${
                timeLeft <= 10 ? 'text-red-500' : timeLeft <= 30 ? 'text-orange-500' : 'text-gray-500'
              }`}>
                {formatTime(timeLeft)}
              </span>
            )}
            <div className="text-2xl font-bold text-blue-600 tabular-nums">
              {countries.length}
            </div>
            {/* Map toggle button — mobile only */}
            {state.mapMode && (
              <button
                onClick={() => setMapOverlayOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Show map"
              >
                🌍
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body — two-column on desktop when map mode, single column otherwise */}
      <div className={`flex-1 flex flex-col min-h-0 ${state.mapMode ? 'md:flex-row' : ''}`}>

        {/* Map column — desktop only */}
        {state.mapMode && (
          <div className="hidden md:flex md:flex-[3] md:border-r border-gray-100 dark:border-gray-700 md:items-start md:p-6 md:pt-8">
            <WorldMap
              p1Countries={countries}
              p2Countries={[]}
              p1Name={name}
              p2Name=""
              continent={mapContinent}
              variant="play"
            />
          </div>
        )}

        {/* Input + list + done column */}
        <div className={`flex flex-col min-h-0 ${state.mapMode ? 'flex-1 md:flex-[2] md:overflow-y-auto' : 'flex-1'}`}>
          {inputPanel}
        </div>

      </div>
    </div>
  );
}
