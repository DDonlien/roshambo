import { Card, InsertEdge, RPS } from './types';

const WIN_MAP: Record<RPS, RPS | null> = {
  [RPS.ROCK]: RPS.SCISSORS,
  [RPS.SCISSORS]: RPS.PAPER,
  [RPS.PAPER]: RPS.ROCK,
  [RPS.BLANK]: null
};

const SCORE_WEIGHTS: Record<RPS, number> = {
  [RPS.ROCK]: 4,
  [RPS.SCISSORS]: 3,
  [RPS.PAPER]: 1,
  [RPS.BLANK]: 0
};

export interface LaneResult {
  newGrid: RPS[][];
  totalScore: number;
  penalty: number;
  laneScores: number[];
  replacedCells: { r: number; c: number }[];
  shiftedLanes: { index: number; type: 'row' | 'col'; direction: 1 | -1 }[];
}

/**
 * Shifts a row or column in the grid with loopback.
 */
function shiftLane(grid: RPS[][], index: number, type: 'row' | 'col', direction: 1 | -1): void {
  if (type === 'row') {
    const row = grid[index];
    if (direction === 1) {
      const last = row[2];
      row[2] = row[1]; row[1] = row[0]; row[0] = last;
    } else {
      const first = row[0];
      row[0] = row[1]; row[1] = row[2]; row[2] = first;
    }
  } else {
    if (direction === 1) {
      const last = grid[2][index];
      grid[2][index] = grid[1][index]; grid[1][index] = grid[0][index]; grid[0][index] = last;
    } else {
      const first = grid[0][index];
      grid[0][index] = grid[1][index]; grid[1][index] = grid[2][index]; grid[2][index] = first;
    }
  }
}

export function executeLaneClash(
  currentGrid: RPS[][],
  edge: InsertEdge,
  card: Card
): LaneResult {
  const newGrid = currentGrid.map(row => [...row]);
  let totalScore = 0;
  let penalty = 0;
  const laneScores: number[] = [0, 0, 0];
  const replacedCells: { r: number; c: number }[] = [];
  const shiftedLanes: { index: number; type: 'row' | 'col'; direction: 1 | -1 }[] = [];

  for (let i = 0; i < 3; i++) {
    const attacker = card.symbols[i];
    let r = 0, c = 0, dr = 0, dc = 0;

    if (edge === 'TOP') { r = 0; c = i; dr = 1; dc = 0; }
    else if (edge === 'BOTTOM') { r = 2; c = i; dr = -1; dc = 0; }
    else if (edge === 'LEFT') { r = i; c = 0; dr = 0; dc = 1; }
    else if (edge === 'RIGHT') { r = i; c = 2; dr = 0; dc = -1; }

    const defender = newGrid[r][c];
    
    // NEW RULE: BLANK attacker loses to ANY non-BLANK defender.
    const attackerLoses = defender !== RPS.BLANK && (attacker === RPS.BLANK || WIN_MAP[defender] === attacker);

    if (attackerLoses) {
      // PENALTY: Use the weight of the ATTACKER card block
      const attackerVal = Number(SCORE_WEIGHTS[attacker]) || 0;
      penalty += attackerVal;

      if (edge === 'LEFT' || edge === 'RIGHT') {
        const shiftDir: 1 | -1 = edge === 'LEFT' ? -1 : 1;
        shiftLane(newGrid, i, 'row', shiftDir);
        shiftedLanes.push({ index: i, type: 'row', direction: shiftDir });
      } else {
        const shiftDir: 1 | -1 = edge === 'TOP' ? -1 : 1;
        shiftLane(newGrid, i, 'col', shiftDir);
        shiftedLanes.push({ index: i, type: 'col', direction: shiftDir });
      }
    } else if (attacker !== RPS.BLANK) {
      for (let step = 0; step < 3; step++) {
        const currentDefender = newGrid[r][c];
        const attackerWins = (WIN_MAP[attacker] === currentDefender) || (currentDefender === RPS.BLANK);

        if (attackerWins) {
          const gain = Number(SCORE_WEIGHTS[currentDefender]) || 0;
          totalScore += gain;
          laneScores[i] += gain;
          newGrid[r][c] = attacker;
          replacedCells.push({ r, c });
          r += dr; c += dc;
          if (r < 0 || r > 2 || c < 0 || c > 2) break;
        } else {
          break;
        }
      }
    }
  }

  return { 
    newGrid, 
    scoreDelta: totalScore || 0, 
    penalty: penalty || 0, 
    laneScores, 
    replacedCells, 
    shiftedLanes 
  };
}

export function createEmptyGrid(): RPS[][] {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => RPS.BLANK));
}
