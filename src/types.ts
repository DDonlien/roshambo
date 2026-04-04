export enum RPS {
  ROCK = 'ROCK',
  SCISSORS = 'SCISSORS',
  PAPER = 'PAPER',
  BLANK = 'BLANK'
}

export interface Card {
  id: string;
  symbols: [RPS, RPS, RPS];
}

export interface MatrixTheme {
  element: RPS;
  power: number;
}

export interface Matrix {
  grid: RPS[][];
  theme: MatrixTheme;
}

export type InsertEdge = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';

export interface ShiftResult {
  newGrid: RPS[][];
  pushedOutSymbols: [RPS, RPS, RPS];
}

export interface ResolutionResult {
  won: boolean;
  oldTheme: MatrixTheme;
  newTheme: MatrixTheme;
  pushedOutCard: Card | null;
  insertedCardId: string;
  scoreDelta: number;
}

export interface GameConfig {
  initialTargetScore: number;
}

export interface GameState {
  matrix: Matrix;
  hand: Card[];
  currentScore: number;
  targetScore: number;
  blind: number;
  selectedCardId: string | null;
  status: 'PLAYING' | 'GAME_OVER';
  lastResolution: ResolutionResult | null;
}
