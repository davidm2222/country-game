'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getGameState, setGameState, otherPlayer, playerName, playerCountries } from '@/lib/gameState';
import { matchCountry } from '@/lib/matcher';
import { GameState, MatchResult } from '@/types';

export default function PlayPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listBottomRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<GameState | null>(null);
  const [input, setInput] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<MatchResult | null>(null);
  const [highlightDup, setHighlightDup] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const s = getGameState();
    if (!s.player1Name) { router.replace('/'); return; }
    setState(s);
    setCountries(playerCountries(s, s.currentPlayer));
    inputRef.current?.focus();
  }, [router]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  }, []);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const result = matchCountry(trimmed, countries);
    setFeedback(result);

    if (result.type === 'exact') {
      const updated = [...countries, result.country.name];
      setCountries(updated);
      setInput('');
      setFeedback(null);
      setTimeout(() => listBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (result.type === 'duplicate') {
      setHighlightDup(result.country.name);
      setTimeout(() => setHighlightDup(null), 1500);
      setInput('');
      setFeedback(null);
      triggerShake();
    } else if (result.type === 'suggestion') {
      // Show suggestion inline — handled in UI below
    } else {
      triggerShake();
    }
  }

  function acceptSuggestion() {
    if (feedback?.type !== 'suggestion') return;
    const updated = [...countries, feedback.country.name];
    setCountries(updated);
    setInput('');
    setFeedback(null);
    setTimeout(() => listBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    inputRef.current?.focus();
  }

  function rejectSuggestion() {
    setFeedback(null);
    inputRef.current?.focus();
  }

  function handleDone() {
    if (!state) return;
    const { currentPlayer, round } = state;

    // Save this player's countries
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
  }

  if (!state) return null;

  const name = playerName(state, state.currentPlayer);

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <header className="flex-none border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Round {state.round} of 2
            </p>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              {name}&apos;s Turn
            </h1>
          </div>
          <div className="text-2xl font-bold text-blue-600 tabular-nums">
            {countries.length}
          </div>
        </div>
      </header>

      {/* Input area */}
      <div className="flex-none px-4 pt-4 pb-3 border-b border-gray-100 max-w-lg mx-auto w-full">
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
            className={`flex-1 border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${shaking ? 'shake border-red-400' : 'border-gray-300'}
              ${feedback?.type === 'none' ? 'border-red-400 bg-red-50' : ''}`}
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            Add
          </button>
        </div>

        {/* Feedback messages */}
        <div className="mt-2 min-h-[2rem]">
          {feedback?.type === 'suggestion' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">
                Did you mean <strong className="text-gray-900">{feedback.country.name}</strong>?
              </span>
              <button
                onClick={acceptSuggestion}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={rejectSuggestion}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                No
              </button>
            </div>
          )}
          {feedback?.type === 'none' && (
            <p className="text-sm text-red-500">Not recognized — try again</p>
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
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-50 text-green-800'}`}
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
        <div ref={listBottomRef} />
      </div>

      {/* Done button */}
      <div className="flex-none px-4 py-4 border-t border-gray-100 max-w-lg mx-auto w-full">
        <button
          onClick={handleDone}
          className="w-full py-4 rounded-xl font-semibold text-white bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all text-lg"
        >
          I&apos;m Done ({countries.length} {countries.length === 1 ? 'country' : 'countries'})
        </button>
      </div>
    </div>
  );
}
