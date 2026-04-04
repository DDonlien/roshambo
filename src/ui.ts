import { GameStore, KNOWN_ASSETS } from './state';
import { Card, InsertEdge, RPS } from './types';
import { gsap } from 'gsap';

const EDGE_ORDER: readonly InsertEdge[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];

function blockAsset(symbol: RPS): string {
  const nameMap: Record<RPS, string> = {
    [RPS.ROCK]: 'Rock',
    [RPS.SCISSORS]: 'Scissors',
    [RPS.PAPER]: 'Paper',
    [RPS.BLANK]: 'Blank'
  };
  return `Sketch/BlockType=${nameMap[symbol]}.png`;
}

function cardAsset(card: Card): { src: string; rotate: boolean } {
  const map: Record<RPS, string> = {
    [RPS.BLANK]: '0',
    [RPS.PAPER]: '1',
    [RPS.SCISSORS]: '3',
    [RPS.ROCK]: '4'
  };
  const code = card.symbols.map((s) => map[s]).join('');
  
  if (KNOWN_ASSETS.includes(code)) {
    return { src: `Sketch/CardType=${code}.png`, rotate: false };
  }

  const flippedSymbols = [...card.symbols].reverse();
  const flippedCode = flippedSymbols.map((s) => map[s as RPS]).join('');
  
  if (KNOWN_ASSETS.includes(flippedCode)) {
    return { src: `Sketch/CardType=${flippedCode}.png`, rotate: true };
  }

  return { src: `Sketch/CardType=000.png`, rotate: false };
}

export class GameUI {
  private matrixWrapperElement: HTMLElement | null = null;
  private matrixElement: HTMLElement | null = null;
  private previewBoxElement: HTMLElement | null = null;
  private handElement: HTMLElement | null = null;
  private lastHandIdStr: string = '';
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isAnimating: boolean = false;

  constructor(private readonly store: GameStore, private readonly root: HTMLElement) {}

  mount(): void {
    this.initialRender();
  }

  private initialRender(): void {
    this.root.innerHTML = '';
    this.root.id = 'app';

    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
      <div class="sidebar-title">Roshambo!</div>
      <div style="flex: 1"></div>
      <div class="score-box">
        <span class="label">SCORE</span>
        <span class="value" id="ui-score">0</span>
      </div>
      <div class="vs-panel" style="padding: 10px;">
        <div class="vs-result" id="ui-clash-score" style="font-size: 1.2rem; color: var(--orange-accent); text-align: center;">
          CLASH!
        </div>
      </div>
      <div class="deck-actions">
        <div class="deck-btn" id="ui-btn-shuffle">
          <span class="label">SHUFFLE</span>
          <div class="val-box"><span class="val blue" id="ui-shuffle-count">4</span></div>
        </div>
        <div class="deck-btn" id="ui-btn-deal">
          <span class="label">DEAL</span>
          <div class="val-box"><span class="val red" id="ui-deal-count">4</span></div>
        </div>
      </div>
      <div style="flex: 1"></div>
      <div class="action-row">
        <button class="btn-end" id="ui-btn-end">END</button>
        <button class="btn-rotate" id="ui-btn-rotate" disabled>Rotate</button>
      </div>
    `;
    this.root.appendChild(sidebar);

    const playArea = document.createElement('div');
    playArea.className = 'play-area';
    
    const relics = document.createElement('div');
    relics.className = 'relics-row';
    relics.innerHTML = '<div class="relic-slot"></div><div class="relic-slot"></div>';
    playArea.appendChild(relics);

    const matrixWrapper = document.createElement('div');
    matrixWrapper.className = 'matrix-wrapper';
    this.matrixWrapperElement = matrixWrapper;

    const matrix = document.createElement('div');
    matrix.className = 'matrix';
    this.matrixElement = matrix;
    matrixWrapper.appendChild(matrix);

    EDGE_ORDER.forEach(edge => {
      const dz = document.createElement('div');
      dz.className = `drop-zone drop-zone-${edge.toLowerCase()}`;
      dz.setAttribute('data-edge', edge);
      
      // Hover to preview
      dz.addEventListener('mouseenter', () => {
        if (this.isAnimating) return;
        if (this.store.getState().selectedCardId) {
          this.store.updatePreview(edge);
          this.render();
        }
      });

      // Click to confirm
      dz.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isAnimating) return;
        if (this.store.getState().selectedCardId) {
          this.handleClash(edge);
        }
      });

      matrixWrapper.appendChild(dz);
      });
    const previewBox = document.createElement('div');
    previewBox.className = 'preview-box';
    this.previewBoxElement = previewBox;
    
    // Click preview box to confirm
    previewBox.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isAnimating) return;
      const lastEdge = (this.store as any).storeInternal?.lastPreviewEdge as InsertEdge | null;
      if (lastEdge) {
        this.handleClash(lastEdge);
      }
    });

    matrixWrapper.appendChild(previewBox);

    matrixWrapper.addEventListener('mouseleave', () => {
      if (this.isAnimating) return;
      this.store.updatePreview(null);
      this.render();
    });

    playArea.appendChild(matrixWrapper);

    const handRow = document.createElement('div');
    handRow.className = 'hand-row';
    this.handElement = handRow;
    playArea.appendChild(handRow);

    this.root.appendChild(playArea);

    this.root.addEventListener('click', (e) => {
      if (this.isAnimating) return;
      const target = e.target as HTMLElement;
      if (!target.closest('.card-asset') && !target.closest('.drop-zone') && !target.closest('.preview-box') && !target.closest('.sidebar')) {
        this.store.selectCard(null);
        this.render();
      }
    });

    this.root.querySelector('#ui-btn-rotate')?.addEventListener('click', () => {
      this.store.flipSelectedCard();
      this.render();
    });
    this.root.querySelector('#ui-btn-end')?.addEventListener('click', () => {
      this.store.resetGame();
      this.render();
    });
    this.root.querySelector('#ui-btn-shuffle')?.addEventListener('click', () => {
      if (this.store.getState().shufflesLeft > 0) {
        this.store.shuffleMatrix();
        this.render();
      }
    });
    this.root.querySelector('#ui-btn-deal')?.addEventListener('click', () => {
      if (this.store.getState().dealsLeft > 0) {
        this.store.dealHand();
        this.render();
      }
    });

    window.addEventListener('resize', () => this.render());
    
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateHeldPosition();
    });

    this.render();
  }

  private async handleClash(edge: InsertEdge): Promise<void> {
    if (this.isAnimating) return;
    
    const result = this.store.playSelectedToEdge(edge);
    if (!result) return;

    this.isAnimating = true;
    
    // Step-by-step animation
    for (let step = 0; step < 3; step++) {
      const cellsToUpdate = result.replacedCells.filter(cell => {
        if (edge === 'TOP') return cell.r === step;
        if (edge === 'BOTTOM') return cell.r === 2 - step;
        if (edge === 'LEFT') return cell.c === step;
        if (edge === 'RIGHT') return cell.c === 2 - step;
        return false;
      });

      if (cellsToUpdate.length > 0) {
        // Calculate punch direction (attacker pushing in)
        const pushOffset = 40;
        let startX = 0, startY = 0;
        if (edge === 'TOP') startY = -pushOffset;
        if (edge === 'BOTTOM') startY = pushOffset;
        if (edge === 'LEFT') startX = -pushOffset;
        if (edge === 'RIGHT') startX = pushOffset;

        cellsToUpdate.forEach(cell => {
          const index = cell.r * 3 + cell.c;
          const img = this.matrixElement?.children[index] as HTMLImageElement;
          if (img) {
            img.src = blockAsset(result.newGrid[cell.r][cell.c]);
            gsap.fromTo(img, 
              { x: startX, y: startY, scale: 1.6, zIndex: 10, filter: 'brightness(2) drop-shadow(0 0 15px rgba(255,152,0,1))' },
              { x: 0, y: 0, scale: 1, zIndex: 1, filter: 'brightness(1) drop-shadow(0 0 0px rgba(0,0,0,0))', duration: 0.5, ease: "back.out(1.7)" }
            );
          }
        });
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    this.store.applyClashResult(result);
    this.isAnimating = false;
    this.render();
  }

  private updateHeldPosition(): void {
    const held = document.querySelector('.card-asset.held') as HTMLElement;
    if (held) {
      held.style.left = `${this.mouseX}px`;
      held.style.top = `${this.mouseY}px`;
    }
  }

  private render(): void {
    const state = this.store.getState();
    const lastPreviewEdge = (this.store as any).storeInternal?.lastPreviewEdge as InsertEdge | null;

    const scoreEl = document.getElementById('ui-score');
    if (scoreEl) scoreEl.textContent = state.currentScore.toString();

    const shuffleBtn = document.getElementById('ui-btn-shuffle');
    if (shuffleBtn) {
      shuffleBtn.querySelector('.val')!.textContent = state.shufflesLeft.toString();
      state.shufflesLeft <= 0 || state.status !== 'PLAYING' ? shuffleBtn.classList.add('disabled') : shuffleBtn.classList.remove('disabled');
    }

    const dealBtn = document.getElementById('ui-btn-deal');
    if (dealBtn) {
      dealBtn.querySelector('.val')!.textContent = state.dealsLeft.toString();
      state.dealsLeft <= 0 || state.status !== 'PLAYING' ? dealBtn.classList.add('disabled') : dealBtn.classList.remove('disabled');
    }

    (document.getElementById('ui-btn-rotate') as HTMLButtonElement).disabled = !state.selectedCardId;

    const clashScoreEl = document.getElementById('ui-clash-score');
    if (clashScoreEl) {
      if (state.preview) {
        clashScoreEl.innerHTML = `GAIN: <span style="color: var(--orange-accent)">+${state.preview.scoreDelta}</span>`;
      } else {
        clashScoreEl.textContent = 'LANE CLASH';
      }
    }

    // Matrix
    if (this.matrixWrapperElement) {
      this.matrixWrapperElement.className = `matrix-wrapper ${state.selectedCardId ? 'state-pick' : ''} ${state.preview ? 'state-preview' : ''}`;
      if (this.previewBoxElement) this.previewBoxElement.className = `preview-box preview-${lastPreviewEdge?.toLowerCase() || ''}`;
    }

    if (this.matrixElement) {
      this.matrixElement.innerHTML = '';
      // Always render the base matrix grid, NOT the preview grid, 
      // to keep the board stable until animation starts.
      const gridToRender = state.matrix.grid;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const img = document.createElement('img');
          img.src = blockAsset(gridToRender[r][c]);
          // Subtle highlight for lanes that will be affected
          if (state.preview) {
            const isReplaced = state.preview.replacedCells.some(cell => cell.r === r && cell.c === c);
            if (isReplaced) img.style.filter = 'drop-shadow(0 0 5px rgba(255, 152, 0, 0.4))';
          }
          this.matrixElement.appendChild(img);
        }
      }
    }

    EDGE_ORDER.forEach(edge => {
      const dz = this.matrixWrapperElement?.querySelector(`.drop-zone-${edge.toLowerCase()}`) as HTMLElement;
      if (!dz) return;
      dz.innerHTML = '';
      
      // Visual Card Attachment: Show the 3 blocks of the card outside the matrix
      if (state.preview && lastPreviewEdge === edge) {
        const selectedCard = state.hand.find(c => c.id === state.selectedCardId);
        if (selectedCard) {
          const cardContainer = document.createElement('div');
          selectedCard.symbols.forEach(s => {
            const img = document.createElement('img');
            img.src = blockAsset(s);
            cardContainer.appendChild(img);
          });
          // No data-flipped here: symbols are already in order, 
          // and we want icons to stay upright.
          dz.appendChild(cardContainer);
        }
      }
    });

    // Hand Cards
    if (this.handElement) {
      const currentHandIdStr = state.hand.map(c => c.id).join(',');
      const handChanged = currentHandIdStr !== this.lastHandIdStr;

      if (handChanged) {
        this.handElement.innerHTML = '';
        this.lastHandIdStr = currentHandIdStr;

        state.hand.forEach((card) => {
          const img = document.createElement('img');
          img.className = 'card-asset';
          img.setAttribute('data-card-id', card.id);
          const asset = cardAsset(card);
          img.src = asset.src;

          img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.selectedCardId === card.id) {
              this.store.selectCard(null);
            } else {
              this.store.selectCard(card.id);
            }
            this.render();
          });

          this.handElement!.appendChild(img);
        });
      }

      const cardCount = state.hand.length;
      Array.from(this.handElement.children).forEach((el, index) => {
        const img = el as HTMLImageElement;
        const card = state.hand[index];
        const asset = cardAsset(card);
        img.src = asset.src;
        
        const isSelected = state.selectedCardId === card.id;
        const isAttached = isSelected && state.preview !== null;
        const isHeld = isSelected && state.preview === null;

        if (isAttached) {
          img.className = 'card-asset hidden';
        } else if (isHeld) {
          img.className = 'card-asset held';
          img.style.left = `${this.mouseX}px`;
          img.style.top = `${this.mouseY}px`;
        } else {
          img.className = `card-asset ${isSelected ? 'selected' : ''}`;
        }

        const angleStep = 10;
        const startAngle = -((cardCount - 1) * angleStep) / 2;
        const angle = startAngle + index * angleStep;
        const vmin = Math.min(window.innerHeight, window.innerWidth);
        const fanX = Math.sin(angle * Math.PI / 180) * (vmin * 0.15);
        const fanY = (1 - Math.cos(angle * Math.PI / 180)) * (vmin * 0.04);
        
        if (!isHeld && !isAttached) {
          gsap.to(img, {
            rotation: angle + (asset.rotate ? 180 : 0),
            x: fanX,
            y: fanY,
            xPercent: 0,
            yPercent: 0,
            transformOrigin: "50% 50%",
            zIndex: isSelected ? 1000 : index,
            clearProps: "left,top,position",
            duration: 0.2
          });
        } else if (isHeld) {
          gsap.set(img, { 
            rotation: asset.rotate ? 180 : 0, 
            zIndex: 2000,
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "50% 50%",
            x: 0,
            y: 0
          });
        }
      });
    }

    // Game Over
    let overlay = this.root.querySelector('.modal-overlay');
    if (state.status === 'GAME_OVER') {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
          <div class="modal-content" style="background:#2F3F45; padding:40px; border-radius:12px; text-align:center;">
            <h1>Game Over</h1>
            <p id="final-score-text" style="font-size:1.5rem; margin:20px 0; color:#FFC107;"></p>
            <button id="restart-btn" style="padding:15px 30px; font-size:1.2rem; background:#F44336; color:white; border:none; border-radius:8px; cursor:pointer;">Try Again</button>
          </div>
        `;
        this.root.appendChild(overlay);
        overlay.querySelector('#restart-btn')?.addEventListener('click', () => { this.store.resetGame(); this.render(); });
      }
      (overlay.querySelector('#final-score-text') as HTMLElement).textContent = `Final Score: ${state.currentScore}`;
    } else if (overlay) overlay.remove();
  }
}
