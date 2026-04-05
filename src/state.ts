import { executeLaneClash, createEmptyGrid } from './logic';
import { Card, GameConfig, GameState, InsertEdge, RPS, ClashResult, LevelConfig } from './types';

const SYMBOL_POOL: readonly RPS[] = [RPS.ROCK, RPS.SCISSORS, RPS.PAPER, RPS.BLANK];

const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1, goal: 100, reward: 10 },
  { level: 2, goal: 300, reward: 25 },
  { level: 3, goal: 800, reward: 50 }
];

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

function createDeck(type: number): Card[] {
  const codes: string[] = [];
  if (type === 1) {
    codes.push('100', '100', '100', '300', '300', '300', '400', '400', '400', '130', '140', '310', '340', '410', '430');
  } else if (type === 2) {
    codes.push('110', '110', '110', '330', '330', '330', '440', '440', '440', '113', '334', '441', '114', '331', '443');
  } else {
    codes.push('111', '111', '111', '333', '333', '333', '444', '444', '444', '134', '341', '413', '431', '143', '314');
  }
  
  const deck = codes.map(code => ({
    id: randomId(),
    symbols: [MAP_TO_RPS[code[0]], MAP_TO_RPS[code[1]], MAP_TO_RPS[code[2]]] as [RPS, RPS, RPS]
  }));
  
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export class GameStore {
  private state: GameState;
  private levelConfigs: LevelConfig[] = DEFAULT_LEVELS;

  constructor(_config: Partial<GameConfig> = {}) {
    this.state = {
      matrix: { grid: randomGrid() },
      hand: [],
      deck: [],
      discardPile: [],
      currentScore: 0,
      gold: 0,
      currentLevel: 1,
      levelGoal: DEFAULT_LEVELS[0].goal,
      shufflesLeft: 4,
      dealsLeft: 4,
      selectedCardId: null,
      status: 'CHOOSE_DECK',
      lastClash: null,
      preview: null
    };
    this.loadLevelConfigs();
  }

  private async loadLevelConfigs(): Promise<void> {
    try {
      const response = await fetch('/levels.csv');
      const text = await response.text();
      const lines = text.trim().split('\n').slice(1);
      if (lines.length > 0) {
        this.levelConfigs = lines.map(line => {
          const [level, goal, reward] = line.split(',').map(Number);
          return { level, goal, reward };
        });
        this.state.levelGoal = this.levelConfigs[0].goal;
      }
    } catch (e) {
      console.warn('Could not load levels.csv, using defaults', e);
    }
  }

  getState(): GameState {
    return {
      ...this.state,
      matrix: {
        grid: this.state.matrix.grid.map((row) => [...row])
      },
      hand: this.state.hand.map((card) => ({ ...card, symbols: [...card.symbols] as [RPS, RPS, RPS] })),
      deck: this.state.deck.map((card) => ({ ...card, symbols: [...card.symbols] as [RPS, RPS, RPS] })),
      discardPile: this.state.discardPile.map((card) => ({ ...card, symbols: [...card.symbols] as [RPS, RPS, RPS] })),
      preview: this.state.preview ? { ...this.state.preview } : null,
      lastClash: this.state.lastClash ? { ...this.state.lastClash } : null
    };
  }

  chooseDeck(type: number): void {
    if (this.state.status !== 'CHOOSE_DECK') return;
    const fullDeck = createDeck(type);
    this.state.hand = fullDeck.slice(0, 5);
    this.state.deck = fullDeck.slice(5);
    this.state.discardPile = [];
    this.state.status = 'PLAYING';
  }

  selectCard(cardId: string | null): void {
    if (this.state.status !== 'PLAYING') return;
    this.state.selectedCardId = (this.state.selectedCardId === cardId || !cardId) ? null : cardId;
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
      if (edge) { this.storeInternal.lastPreviewEdge = null; this.updatePreview(edge); }
    }
  }

  private storeInternal: any = { lastPreviewEdge: null };

  updatePreview(edge: InsertEdge | null): void {
    if (this.storeInternal.lastPreviewEdge === edge && (this.state.preview !== null || edge === null)) return;
    this.storeInternal.lastPreviewEdge = edge;
    if (this.state.status !== 'PLAYING' || !this.state.selectedCardId || !edge) {
      this.state.preview = null; return;
    }
    const selectedCard = this.state.hand.find(c => c.id === this.state.selectedCardId);
    if (!selectedCard) { this.state.preview = null; return; }
    const res = executeLaneClash(this.state.matrix.grid, edge, selectedCard);
    this.state.preview = { ...res, insertedCardId: selectedCard.id };
  }

  playSelectedToEdge(edge: InsertEdge): ClashResult | null {
    if (this.state.status !== 'PLAYING' || !this.state.selectedCardId) return null;
    const selectedCard = this.state.hand.find(c => c.id === this.state.selectedCardId);
    if (!selectedCard) { this.state.selectedCardId = null; return null; }
    const res = executeLaneClash(this.state.matrix.grid, edge, selectedCard);
    return { ...res, insertedCardId: selectedCard.id };
  }

  applyClashResult(result: ClashResult): void {
    this.state.matrix.grid = result.newGrid;
    this.state.currentScore += result.scoreDelta;
    this.state.currentScore -= (result.penalty || 0);
    this.state.lastClash = result;
    const card = this.state.hand.find(c => c.id === result.insertedCardId);
    if (card) this.state.discardPile.push(card);
    this.state.hand = this.state.hand.filter(c => c.id !== result.insertedCardId);
    this.state.selectedCardId = null;
    this.state.preview = null;
    this.checkLevelWin();
    this.resolveRoundEnd();
  }

  private checkLevelWin(): void {
    if (this.state.status !== 'PLAYING') return;
    if (this.state.currentScore >= this.state.levelGoal) {
      const config = this.levelConfigs[this.state.currentLevel - 1];
      this.state.gold += config.reward;
      this.state.status = this.state.currentLevel >= this.levelConfigs.length ? 'WIN' : 'LEVEL_WON';
    }
  }

  nextLevel(): void {
    if (this.state.status !== 'LEVEL_WON') return;
    this.state.currentLevel += 1;
    this.state.levelGoal = this.levelConfigs[this.state.currentLevel - 1].goal;
    this.state.currentScore = 0;
    this.state.matrix.grid = randomGrid();
    this.state.shufflesLeft = 4;
    this.state.dealsLeft = 4;
    this.state.status = 'PLAYING';
    const type = 1; // Default
    const fullDeck = createDeck(type);
    this.state.hand = fullDeck.slice(0, 5);
    this.state.deck = fullDeck.slice(5);
    this.state.discardPile = [];
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
    const needed = 5 - this.state.hand.length;
    if (needed > 0 && this.state.deck.length > 0) {
      const drawnCount = Math.min(needed, this.state.deck.length);
      const drawn = this.state.deck.slice(0, drawnCount);
      this.state.deck = this.state.deck.slice(drawnCount);
      this.state.hand = [...this.state.hand, ...drawn];
      this.state.dealsLeft -= 1;
      this.state.preview = null;
      this.state.selectedCardId = null;
    }
  }

  private resolveRoundEnd(): void {
    if (this.state.status === 'PLAYING' && this.state.hand.length === 0 && this.state.deck.length === 0) {
      this.state.status = 'GAME_OVER';
      this.state.selectedCardId = null;
    }
  }

  resetGame(): void {
    const newStore = new GameStore();
    this.state = newStore.getState();
  }
}
