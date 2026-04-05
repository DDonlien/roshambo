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
  penalty: number;
  laneScores: number[];
  replacedCells: { r: number; c: number }[];
  insertedCardId: string;
  shiftedLanes?: { index: number; type: 'row' | 'col'; direction: 1 | -1 }[];
}

export interface GameConfig {
  initialTargetScore: number;
}

export interface LevelConfig {
  level: number;
  goal: number;
}

export interface GameState {
  matrix: Matrix;
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  currentScore: number;
  gold: number;
  currentLevel: number;
  levelGoal: number;
  shufflesLeft: number;
  dealsLeft: number;
  selectedCardIds: string[];
  status: 'CHOOSE_DECK' | 'PLAYING' | 'LEVEL_WON' | 'GAME_OVER' | 'WIN';
  lastClash: ClashResult | null;
  preview: ClashResult | null;
  lastInterestEarned: number;
}
