import { GameState } from '@/types';

const STORAGE_KEY = 'country-game-state';

const DEFAULT_STATE: GameState = {
  player1Name: '',
  player2Name: '',
  player1Countries: [],
  player2Countries: [],
  currentPlayer: 1,
  round: 1,
  firstPlayer: 1,
  mode: 'classic',
  mapMode: false,
};

export function getGameState(): GameState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return { ...DEFAULT_STATE };
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function setGameState(patch: Partial<GameState>): GameState {
  const current = getGameState();
  const next = { ...current, ...patch };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearGameState(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function otherPlayer(p: 1 | 2): 1 | 2 {
  return p === 1 ? 2 : 1;
}

/** Returns the name for the given player number */
export function playerName(state: GameState, player: 1 | 2): string {
  return player === 1 ? state.player1Name : state.player2Name;
}

/** Returns the countries list for the given player number */
export function playerCountries(state: GameState, player: 1 | 2): string[] {
  return player === 1 ? state.player1Countries : state.player2Countries;
}
