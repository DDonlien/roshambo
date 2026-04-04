export enum RPS {
  ROCK = 'ROCK',
  SCISSORS = 'SCISSORS',
  PAPER = 'PAPER',
  BLANK = 'BLANK'
}

export interface Card {
  id: string;
  symbols: [RPS, RPS, RPS];
  isFlipped?: boolean;
}

export interface Matrix {
  grid: RPS[][];
}

export type InsertEdge = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';

export interface ClashResult {
  newGrid: RPS[][];
  scoreDelta: number;
  replacedCells: { r: number; c: number }[];
  insertedCardId: string;
}

export interface GameConfig {
  initialTargetScore: number;
}

export interface GameState {
  matrix: Matrix;
  hand: Card[];
  currentScore: number;
  shufflesLeft: number;
  dealsLeft: number;
  selectedCardId: string | null;
  status: 'PLAYING' | 'GAME_OVER';
  lastClash: ClashResult | null;
  preview: ClashResult | null;
}
