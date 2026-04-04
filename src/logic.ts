import { Card, InsertEdge, MatrixTheme, RPS, ShiftResult } from './types';

const ELEMENT_PRIORITY: readonly RPS[] = [RPS.ROCK, RPS.SCISSORS, RPS.PAPER];

const WIN_MAP: Record<RPS, RPS | null> = {
  [RPS.ROCK]: RPS.SCISSORS,
  [RPS.SCISSORS]: RPS.PAPER,
  [RPS.PAPER]: RPS.ROCK,
  [RPS.BLANK]: null
};

export function reverseCard(card: Card): Card {
  return {
    ...card,
    symbols: [card.symbols[2], card.symbols[1], card.symbols[0]]
  };
}

export function calculateTheme(grid: RPS[][]): MatrixTheme {
  const counts: Record<RPS, number> = {
    [RPS.ROCK]: 0,
    [RPS.SCISSORS]: 0,
    [RPS.PAPER]: 0,
    [RPS.BLANK]: 0
  };

  for (const row of grid) {
    for (const symbol of row) {
      counts[symbol] += 1;
    }
  }

  let bestElement = RPS.ROCK;
  let bestPower = counts[RPS.ROCK];

  for (const element of ELEMENT_PRIORITY) {
    const power = counts[element];
    if (power > bestPower) {
      bestElement = element;
      bestPower = power;
    }
  }

  return {
    element: bestElement,
    power: bestPower
  };
}

export function createEmptyGrid(): RPS[][] {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => RPS.BLANK));
}

function cloneGrid(grid: RPS[][]): RPS[][] {
  return grid.map((row) => [...row]);
}

export function shiftMatrix(oldGrid: RPS[][], insertEdge: InsertEdge, insertCard: Card): ShiftResult {
  const grid = cloneGrid(oldGrid);

  if (insertEdge === 'RIGHT') {
    const pushedOutSymbols: [RPS, RPS, RPS] = [grid[0][0], grid[1][0], grid[2][0]];
    for (let row = 0; row < 3; row += 1) {
      grid[row][0] = grid[row][1];
      grid[row][1] = grid[row][2];
      grid[row][2] = insertCard.symbols[row];
    }
    return { newGrid: grid, pushedOutSymbols };
  }

  if (insertEdge === 'LEFT') {
    const pushedOutSymbols: [RPS, RPS, RPS] = [grid[0][2], grid[1][2], grid[2][2]];
    for (let row = 0; row < 3; row += 1) {
      grid[row][2] = grid[row][1];
      grid[row][1] = grid[row][0];
      grid[row][0] = insertCard.symbols[row];
    }
    return { newGrid: grid, pushedOutSymbols };
  }

  if (insertEdge === 'TOP') {
    const pushedOutSymbols: [RPS, RPS, RPS] = [grid[2][0], grid[2][1], grid[2][2]];
    for (let col = 0; col < 3; col += 1) {
      grid[2][col] = grid[1][col];
      grid[1][col] = grid[0][col];
      grid[0][col] = insertCard.symbols[col];
    }
    return { newGrid: grid, pushedOutSymbols };
  }

  const pushedOutSymbols: [RPS, RPS, RPS] = [grid[0][0], grid[0][1], grid[0][2]];
  for (let col = 0; col < 3; col += 1) {
    grid[0][col] = grid[1][col];
    grid[1][col] = grid[2][col];
    grid[2][col] = insertCard.symbols[col];
  }
  return { newGrid: grid, pushedOutSymbols };
}

export function compareMatrix(newTheme: MatrixTheme, oldTheme: MatrixTheme): boolean {
  if (WIN_MAP[newTheme.element] === oldTheme.element) {
    return true;
  }

  if (WIN_MAP[oldTheme.element] === newTheme.element) {
    return false;
  }

  if (newTheme.power > oldTheme.power) {
    return true;
  }

  return false;
}
