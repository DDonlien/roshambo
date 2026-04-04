import { GameStore } from './state';
import { Card, InsertEdge, RPS } from './types';

const EDGE_ORDER: readonly InsertEdge[] = ['TOP', 'LEFT', 'RIGHT', 'BOTTOM'];

function blockAsset(symbol: RPS): string {
  const nameMap: Record<RPS, string> = {
    [RPS.ROCK]: 'Rock',
    [RPS.SCISSORS]: 'Scissors',
    [RPS.PAPER]: 'Paper',
    [RPS.BLANK]: 'Blank'
  };
  return `/Sketch/BlockType=${nameMap[symbol]}.png`;
}

function cardAsset(card: Card): string {
  const map: Record<RPS, string> = {
    [RPS.BLANK]: '0',
    [RPS.PAPER]: '1',
    [RPS.SCISSORS]: '3',
    [RPS.ROCK]: '4'
  };
  const code = card.symbols.map((s) => map[s]).join('');
  return `/Sketch/CardType=${code}.png`;
}

function edgeLabel(edge: InsertEdge): string {
  return edge === 'TOP' ? '↑ Top' : edge === 'BOTTOM' ? '↓ Bottom' : edge === 'LEFT' ? '← Left' : '→ Right';
}

export class GameUI {
  constructor(private readonly store: GameStore, private readonly root: HTMLElement) {}

  mount(): void {
    this.render();
  }

  private render(): void {
    const state = this.store.getState();
    this.root.innerHTML = '';

    const app = document.createElement('div');
    app.className = 'game-shell';

    const hud = document.createElement('header');
    hud.className = 'hud';
    hud.innerHTML = `
      <div>Blind: ${state.blind}</div>
      <div>Score: ${state.currentScore} / ${state.targetScore}</div>
      <div>Theme: ${state.matrix.theme.element} (${state.matrix.theme.power})</div>
      <div>Status: ${state.status}</div>
    `;

    const boardWrap = document.createElement('section');
    boardWrap.className = 'board-wrap';

    const matrix = document.createElement('div');
    matrix.className = 'matrix';
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const img = document.createElement('img');
        img.src = blockAsset(state.matrix.grid[row][col]);
        img.alt = state.matrix.grid[row][col];
        cell.appendChild(img);
        matrix.appendChild(cell);
      }
    }
    boardWrap.appendChild(matrix);

    if (state.selectedCardId && state.status === 'PLAYING') {
      const controls = document.createElement('div');
      controls.className = 'edge-controls';

      for (const edge of EDGE_ORDER) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = edgeLabel(edge);
        button.className = 'edge-btn';
        button.addEventListener('click', () => {
          this.store.playSelectedToEdge(edge);
          this.render();
        });
        controls.appendChild(button);
      }

      boardWrap.appendChild(controls);
    }

    const handWrap = document.createElement('section');
    handWrap.className = 'hand-wrap';
    const handTitle = document.createElement('h2');
    handTitle.textContent = `Hand (${state.hand.length})`;
    handWrap.appendChild(handTitle);

    const handRow = document.createElement('div');
    handRow.className = 'hand-row';

    for (const card of state.hand) {
      const cardButton = document.createElement('button');
      cardButton.type = 'button';
      cardButton.className = `card ${state.selectedCardId === card.id ? 'selected' : ''}`;
      const img = document.createElement('img');
      img.src = cardAsset(card);
      img.alt = card.symbols.join('-');
      cardButton.appendChild(img);

      cardButton.addEventListener('click', () => {
        this.store.selectCard(card.id);
        this.render();
      });

      handRow.appendChild(cardButton);
    }
    handWrap.appendChild(handRow);

    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';

    const flip = document.createElement('button');
    flip.type = 'button';
    flip.textContent = 'Flip Selected 180°';
    flip.disabled = !state.selectedCardId || state.status !== 'PLAYING';
    flip.addEventListener('click', () => {
      this.store.flipSelectedCard();
      this.render();
    });

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'Restart';
    reset.addEventListener('click', () => {
      this.store.resetGame();
      this.render();
    });

    actionBar.append(flip, reset);

    const log = document.createElement('p');
    log.className = 'log';
    if (state.lastResolution) {
      const result = state.lastResolution.won ? 'WIN' : 'LOSE';
      log.textContent = `${result}: ${state.lastResolution.newTheme.element}(${state.lastResolution.newTheme.power}) vs ${state.lastResolution.oldTheme.element}(${state.lastResolution.oldTheme.power})`;  
    } else {
      log.textContent = 'Select a card then choose an edge to play.';
    }

    app.append(hud, boardWrap, actionBar, handWrap, log);
    this.root.appendChild(app);
  }
}
