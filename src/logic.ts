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
  replacedCells: { r: number; c: number }[];
}

/**
 * Performs the Lane Penetration Clash logic.
 * For each of the 3 symbols on the card, it clashes with the matrix cells in that lane.
 */
export function executeLaneClash(
  currentGrid: RPS[][],
  edge: InsertEdge,
  card: Card
): LaneResult {
  const newGrid = currentGrid.map(row => [...row]);
  let totalScore = 0;
  const replacedCells: { r: number; c: number }[] = [];

  // Define lanes based on edge
  // TOP: Card is horizontal, symbols[0..2] match cols[0..2], moves TOP -> BOTTOM (rows 0->1->2)
  // BOTTOM: Card is horizontal, symbols[0..2] match cols[0..2], moves BOTTOM -> TOP (rows 2->1->0)
  // LEFT: Card is vertical, symbols[0..2] match rows[0..2], moves LEFT -> RIGHT (cols 0->1->2)
  // RIGHT: Card is vertical, symbols[0..2] match rows[0..2], moves RIGHT -> LEFT (cols 2->1->0)

  for (let i = 0; i < 3; i++) {
    const attacker = card.symbols[i];
    if (attacker === RPS.BLANK) continue;

    let r = 0, c = 0;
    let dr = 0, dc = 0;

    if (edge === 'TOP') {
      r = 0; c = i; dr = 1; dc = 0;
    } else if (edge === 'BOTTOM') {
      r = 2; c = i; dr = -1; dc = 0;
    } else if (edge === 'LEFT') {
      r = i; c = 0; dr = 0; dc = 1;
    } else if (edge === 'RIGHT') {
      r = i; c = 2; dr = 0; dc = -1;
    }

    // Clash through the lane
    for (let step = 0; step < 3; step++) {
      const defender = newGrid[r][c];
      
      // RPS Check: Does Attacker beat Defender?
      // Special Rule: If Defender is BLANK, Attacker always wins? 
      // Requirement says "RPS single-player判定". Usually RPS rules: Rock beats Scissors, etc.
      // If Blank is considered a "symbol", and its WIN_MAP is null, it beats nothing.
      // But usually in these games, Blank is an easy target.
      const attackerWins = (WIN_MAP[attacker] === defender) || (defender === RPS.BLANK);

      if (attackerWins) {
        // WIN: Replace, add score, move forward
        totalScore += SCORE_WEIGHTS[defender];
        newGrid[r][c] = attacker;
        replacedCells.push({ r, c });
        
        r += dr;
        c += dc;
        if (r < 0 || r > 2 || c < 0 || c > 2) break; // Reached boundary
      } else {
        // TIE or LOSE: Stop lane
        break;
      }
    }
  }

  return { newGrid, totalScore, replacedCells };
}

export function createEmptyGrid(): RPS[][] {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => RPS.BLANK));
}
