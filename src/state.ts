import { executeLaneClash, createEmptyGrid } from './logic';
import { Card, GameConfig, GameState, InsertEdge, RPS, ClashResult } from './types';

const SYMBOL_POOL: readonly RPS[] = [RPS.ROCK, RPS.SCISSORS, RPS.PAPER, RPS.BLANK];

function randomId(): string {
  return crypto.randomUUID();
}

function randomSymbol(): RPS {
  return SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
}

export const KNOWN_ASSETS = [
  '000', '010', '030', '040', '100', '101', '110', '111', '130', '131', '140', '141',
  '300', '301', '303', '310', '311', '313', '330', '331', '333', '340', '341', '343',
  '400', '401', '403', '404', '410', '411', '413', '414', '430', '431', '433', '434',
  '440', '441', '443', '444'
];

const MAP_TO_RPS: Record<string, RPS> = {
  '0': RPS.BLANK,
  '1': RPS.PAPER,
  '3': RPS.SCISSORS,
  '4': RPS.ROCK
};

function randomCard(): Card {
  const code = KNOWN_ASSETS[Math.floor(Math.random() * KNOWN_ASSETS.length)];
  return {
    id: randomId(),
    symbols: [MAP_TO_RPS[code[0]], MAP_TO_RPS[code[1]], MAP_TO_RPS[code[2]]]
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

function createInitialHand(): Card[] {
  return Array.from({ length: 6 }, () => randomCard());
}

function findCard(hand: Card[], cardId: string): Card | undefined {
  return hand.find((card) => card.id === cardId);
}

export class GameStore {
  private state: GameState;

  constructor(_config: Partial<GameConfig> = {}) {
    this.state = {
      matrix: { grid: randomGrid() },
      hand: createInitialHand(),
      currentScore: 0,
      shufflesLeft: 4,
      dealsLeft: 4,
      selectedCardId: null,
      status: 'PLAYING',
      lastClash: null,
      preview: null
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      matrix: {
        grid: this.state.matrix.grid.map((row) => [...row])
      },
      hand: this.state.hand.map((card) => ({ 
        ...card, 
        symbols: [...card.symbols] as [RPS, RPS, RPS] 
      })),
      preview: this.state.preview ? { ...this.state.preview } : null,
      lastClash: this.state.lastClash ? { ...this.state.lastClash } : null
    };
  }

  selectCard(cardId: string | null): void {
    if (this.state.status !== 'PLAYING') return;

    if (this.state.selectedCardId === cardId || cardId === null || cardId === '') {
      this.state.selectedCardId = null;
    } else {
      this.state.selectedCardId = cardId;
    }
    this.state.preview = null;
    this.storeInternal.lastPreviewEdge = null;
  }

  flipSelectedCard(): void {
    const selected = this.state.selectedCardId;
    if (!selected || this.state.status !== 'PLAYING') return;

    this.state.hand = this.state.hand.map((card) => {
      if (card.id !== selected) return card;
      const newSymbols: [RPS, RPS, RPS] = [card.symbols[2], card.symbols[1], card.symbols[0]];
      return { ...card, symbols: newSymbols, isFlipped: !card.isFlipped };
    });
    
    if (this.state.preview) {
      const edge = this.storeInternal.lastPreviewEdge;
      if (edge) {
        this.storeInternal.lastPreviewEdge = null; 
        this.updatePreview(edge);
      }
    }
  }

  private storeInternal: any = { lastPreviewEdge: null };

  updatePreview(edge: InsertEdge | null): void {
    if (this.storeInternal.lastPreviewEdge === edge && (this.state.preview !== null || edge === null)) {
      return;
    }
    
    this.storeInternal.lastPreviewEdge = edge;
    if (this.state.status !== 'PLAYING' || !this.state.selectedCardId || !edge) {
      this.state.preview = null;
      return;
    }

    const selectedCard = findCard(this.state.hand, this.state.selectedCardId);
    if (!selectedCard) {
      this.state.preview = null;
      return;
    }

    const { newGrid, totalScore, replacedCells } = executeLaneClash(this.state.matrix.grid, edge, selectedCard);

    this.state.preview = {
      newGrid,
      scoreDelta: totalScore,
      replacedCells,
      insertedCardId: selectedCard.id
    };
  }

  playSelectedToEdge(edge: InsertEdge): ClashResult | null {
    if (this.state.status !== 'PLAYING' || !this.state.selectedCardId) return null;

    const selectedCard = findCard(this.state.hand, this.state.selectedCardId);
    if (!selectedCard) {
      this.state.selectedCardId = null;
      return null;
    }

    const { newGrid, totalScore, replacedCells } = executeLaneClash(this.state.matrix.grid, edge, selectedCard);

    const result: ClashResult = {
      newGrid,
      scoreDelta: totalScore,
      replacedCells,
      insertedCardId: selectedCard.id
    };

    return result;
  }

  applyClashResult(result: ClashResult): void {
    this.state.matrix.grid = result.newGrid;
    this.state.currentScore += result.scoreDelta;
    this.state.lastClash = result;

    // Remove card from hand
    this.state.hand = this.state.hand.filter((card) => card.id !== result.insertedCardId);
    this.state.selectedCardId = null;
    this.state.preview = null;
    this.resolveRoundEnd();
  }

  shuffleMatrix(): void {
    if (this.state.status !== 'PLAYING' || this.state.shufflesLeft <= 0) return;
    this.state.matrix.grid = randomGrid();
    this.state.shufflesLeft -= 1;
    this.state.preview = null;
    this.state.selectedCardId = null;
  }

  dealHand(): void {
    if (this.state.status !== 'PLAYING' || this.state.dealsLeft <= 0) return;
    const count = this.state.hand.length;
    if (count > 0) {
      this.state.hand = Array.from({ length: count }, () => randomCard());
      this.state.dealsLeft -= 1;
      this.state.preview = null;
      this.state.selectedCardId = null;
    }
  }

  private resolveRoundEnd(): void {
    if (this.state.hand.length === 0) {
      this.state.status = 'GAME_OVER';
      this.state.selectedCardId = null;
    }
  }

  resetGame(): void {
    const newStore = new GameStore();
    this.state = newStore.getState();
  }
}
