export interface Country {
  name: string;
  iso3: string;
  isoN: number; // ISO 3166-1 numeric, used for map coloring (-1 if not in world-atlas)
  aliases: string[];
}

export type GamePhase = 'start' | 'play' | 'handoff' | 'reveal';

export interface GameState {
  player1Name: string;
  player2Name: string;
  player1Countries: string[]; // canonical country names
  player2Countries: string[]; // canonical country names
  currentPlayer: 1 | 2;      // whose turn is active right now
  round: 1 | 2;              // 1 = first player this game, 2 = second player
  firstPlayer: 1 | 2;        // who went first (tracked for rematch swap)
}

export type MatchResult =
  | { type: 'exact'; country: Country }
  | { type: 'suggestion'; country: Country }
  | { type: 'duplicate'; country: Country }
  | { type: 'none' };
