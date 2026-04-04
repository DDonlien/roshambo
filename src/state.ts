import { calculateTheme, compareMatrix, createEmptyGrid, reverseCard, shiftMatrix } from './logic';
import { Card, GameConfig, GameState, InsertEdge, Matrix, RPS } from './types';

const DEFAULT_CONFIG: GameConfig = {
  initialTargetScore: 150
};

const SYMBOL_POOL: readonly RPS[] = [RPS.ROCK, RPS.SCISSORS, RPS.PAPER, RPS.BLANK];

function randomId(): string {
  return crypto.randomUUID();
}

function randomSymbol(): RPS {
  return SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
}

function randomCard(): Card {
  return {
    id: randomId(),
    symbols: [randomSymbol(), randomSymbol(), randomSymbol()]
  };
}

function randomGrid(): RPS[][] {
  const grid = createEmptyGrid();
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      grid[row][col] = randomSymbol();
    }
  }
  return grid;
}

function createMatrix(grid: RPS[][]): Matrix {
  return {
    grid,
    theme: calculateTheme(grid)
  };
}

function createInitialHand(): Card[] {
  return Array.from({ length: 6 }, () => randomCard());
}

function findCard(hand: Card[], cardId: string): Card | undefined {
  return hand.find((card) => card.id === cardId);
}

export class GameStore {
  private state: GameState;

  constructor(config: Partial<GameConfig> = {}) {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const initialGrid = randomGrid();
    this.state = {
      matrix: createMatrix(initialGrid),
      hand: createInitialHand(),
      currentScore: 0,
      targetScore: mergedConfig.initialTargetScore,
      blind: 1,
      selectedCardId: null,
      status: 'PLAYING',
      lastResolution: null
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      matrix: {
        ...this.state.matrix,
        grid: this.state.matrix.grid.map((row) => [...row])
      },
      hand: this.state.hand.map((card) => ({ ...card, symbols: [...card.symbols] as [RPS, RPS, RPS] }))
    };
  }

  selectCard(cardId: string): void {
    if (this.state.status !== 'PLAYING') {
      return;
    }

    const found = findCard(this.state.hand, cardId);
    this.state.selectedCardId = found ? cardId : null;
  }

  flipSelectedCard(): void {
    const selected = this.state.selectedCardId;
    if (!selected || this.state.status !== 'PLAYING') {
      return;
    }

    this.state.hand = this.state.hand.map((card) => {
      if (card.id !== selected) {
        return card;
      }
      return reverseCard(card);
    });
  }

  playSelectedToEdge(edge: InsertEdge): void {
    if (this.state.status !== 'PLAYING' || !this.state.selectedCardId) {
      return;
    }

    const selectedCard = findCard(this.state.hand, this.state.selectedCardId);
    if (!selectedCard) {
      this.state.selectedCardId = null;
      return;
    }

    const oldMatrix = this.state.matrix;
    const shifted = shiftMatrix(oldMatrix.grid, edge, selectedCard);
    const newTheme = calculateTheme(shifted.newGrid);
    const didWin = compareMatrix(newTheme, oldMatrix.theme);

    if (didWin) {
      const pushedOutCard: Card = {
        id: randomId(),
        symbols: shifted.pushedOutSymbols
      };
      this.state.matrix = {
        grid: shifted.newGrid,
        theme: newTheme
      };
      this.state.hand = this.state.hand.filter((card) => card.id !== selectedCard.id);
      this.state.hand.push(pushedOutCard);

      const scoreDelta = oldMatrix.theme.power * 10;
      this.state.currentScore += scoreDelta;
      this.state.lastResolution = {
        won: true,
        oldTheme: oldMatrix.theme,
        newTheme,
        pushedOutCard,
        insertedCardId: selectedCard.id,
        scoreDelta
      };
    } else {
      this.state.hand = this.state.hand.filter((card) => card.id !== selectedCard.id);
      this.state.lastResolution = {
        won: false,
        oldTheme: oldMatrix.theme,
        newTheme,
        pushedOutCard: null,
        insertedCardId: selectedCard.id,
        scoreDelta: 0
      };
    }

    this.state.selectedCardId = null;
    this.resolveRoundEnd();
  }

  private resolveRoundEnd(): void {
    if (this.state.currentScore >= this.state.targetScore) {
      this.state.blind += 1;
      this.state.targetScore = Math.floor(this.state.targetScore * 1.6);
      this.state.matrix = createMatrix(randomGrid());
      this.state.lastResolution = null;
      return;
    }

    if (this.state.hand.length === 0 && this.state.currentScore < this.state.targetScore) {
      this.state.status = 'GAME_OVER';
      this.state.selectedCardId = null;
    }
  }

  resetGame(): void {
    const newStore = new GameStore({ initialTargetScore: DEFAULT_CONFIG.initialTargetScore });
    this.state = newStore.getState();
  }
}
