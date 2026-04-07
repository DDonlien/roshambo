import { GameStore, KNOWN_ASSETS } from './state';
import { Card, InsertEdge, RPS, ClashResult } from './types';
import { gsap } from 'gsap';

const EDGE_ORDER: readonly InsertEdge[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];

const SCORE_WEIGHTS: Record<RPS, number> = {
  [RPS.ROCK]: 4,
  [RPS.SCISSORS]: 3,
  [RPS.PAPER]: 1,
  [RPS.BLANK]: 0
};

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
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isAnimating: boolean = false;

  constructor(private readonly store: GameStore, private readonly root: HTMLElement) {}

  mount(): void {
    this.initialRender();
  }

  private initialRender(): void {
    this.root.innerHTML = '';
    
    // Deselect if clicking on empty space
    document.addEventListener('mousedown', (e) => {
      const state = this.store.getState();
      if (state.selectedCardIds.length > 0) {
        const target = e.target as HTMLElement;
        const isCard = target.closest('.card-asset');
        const isDropZone = target.closest('.drop-zone') || target.closest('.preview-box');
        const isButton = target.closest('button') || target.closest('.deck-btn');
        if (!isCard && !isDropZone && !isButton) {
          const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];
          const img = this.handElement?.querySelector(`[data-card-id="${lastId}"]`) as HTMLElement;
          if (img) {
            img.classList.remove('held');
            gsap.set(img, { clearProps: "all" });
          }
          this.store.selectCard(null);
          this.render();
        }
      }
    });

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.width = '100%';
    container.style.height = '100%';

    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
      <div class="sidebar-title">Roshambo!</div>
      <div style="flex: 1"></div>
      <div class="score-box">
        <span class="label">LEVEL</span>
        <span class="value" id="ui-level">1/3</span>
      </div>
      <div class="score-box">
        <span class="label">GOAL</span>
        <span class="value" id="ui-goal">100</span>
      </div>
      <div class="score-box">
        <span class="label">SCORE</span>
        <span class="value" id="ui-score">0</span>
      </div>
      <div class="score-box" style="border-left: 4px solid #FFD700;">
        <span class="label" style="color: #FFD700;">GOLD</span>
        <span class="value" id="ui-gold" style="color: #FFD700;">0</span>
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
      <div class="vs-panel" style="padding: 10px;">
        <div class="vs-result" id="ui-clash-score" style="font-size: 1.2rem; color: var(--orange-accent); text-align: center;">
          LANE CLASH
        </div>
      </div>
      <div class="action-row">
        <button class="btn-end" id="ui-btn-end">END</button>
        <button class="btn-rotate" id="ui-btn-rotate">Rotate</button>
      </div>
    `;
    container.appendChild(sidebar);

    const playArea = document.createElement('div');
    playArea.className = 'play-area';
    container.appendChild(playArea);

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
      
      dz.addEventListener('mouseenter', () => {
        if (this.isAnimating) return;
        const state = this.store.getState();
        if (state.selectedCardIds.length > 0) {
          this.store.updatePreview(edge);
          this.render();
        }
      });

      dz.addEventListener('mouseleave', () => {
        if (this.isAnimating) return;
        this.store.updatePreview(null);
        this.render();
      });

      dz.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isAnimating) return;
        const state = this.store.getState();
        if (state.selectedCardIds.length > 0) {
          this.handleClash(edge);
        }
      });

      matrixWrapper.appendChild(dz);
    });

    const previewBox = document.createElement('div');
    previewBox.className = 'preview-box';
    this.previewBoxElement = previewBox;
    
    previewBox.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isAnimating) return;
      const lastEdge = (this.store as any).storeInternal?.lastPreviewEdge as InsertEdge | null;
      if (lastEdge) {
        this.handleClash(lastEdge);
      }
    });

    matrixWrapper.appendChild(previewBox);
    playArea.appendChild(matrixWrapper);

    const bottomArea = document.createElement('div');
    bottomArea.className = 'bottom-area';
    
    const deckPile = document.createElement('div');
    deckPile.className = 'pile-icon';
    deckPile.id = 'ui-deck-pile';
    deckPile.innerHTML = `<span class="pile-count" id="ui-deck-count">0</span><span class="pile-label">DECK</span>`;
    bottomArea.appendChild(deckPile);

    const hand = document.createElement('div');
    hand.className = 'hand-row';
    this.handElement = hand;
    bottomArea.appendChild(hand);

    const discardPile = document.createElement('div');
    discardPile.className = 'pile-icon';
    discardPile.id = 'ui-discard-pile';
    discardPile.innerHTML = `<span class="pile-count" id="ui-discard-count">0</span><span class="pile-label">WASTED</span>`;
    bottomArea.appendChild(discardPile);

    playArea.appendChild(bottomArea);
    this.root.appendChild(container);

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
    
    const state = this.store.getState();
    const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];
    const selectedCard = state.hand.find(c => c.id === lastId);
    if (!selectedCard) return;

    const result = this.store.playSelectedToEdge(edge);
    if (!result) return;

    this.isAnimating = true;
    
    const dz = this.matrixWrapperElement?.querySelector(`.drop-zone-${edge.toLowerCase()}`) as HTMLElement;
    const dzBlocks = dz ? Array.from(dz.querySelectorAll('img')) : [];
    
    const lanes: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const indices: number[] = [];
      for (let step = 0; step < 3; step++) {
        let r = 0, c = 0;
        if (edge === 'TOP') { r = step; c = i; }
        else if (edge === 'BOTTOM') { r = 2 - step; c = i; }
        else if (edge === 'LEFT') { r = i; c = step; }
        else if (edge === 'RIGHT') { r = i; c = 2 - step; }
        indices.push(r * 3 + c);
      }
      lanes.push(indices);
    }

    let visualScore = Number(state.currentScore) || 0;

    for (let i = 0; i < 3; i++) {
      const laneIndices = lanes[i];
      const attackerBlock = dzBlocks[i];
      
      const firstCellIdx = laneIndices[0];
      const firstCellPos = { r: Math.floor(firstCellIdx / 3), c: firstCellIdx % 3 };
      
      const laneShift = result.shiftedLanes?.find(s => {
        if (edge === 'TOP' || edge === 'BOTTOM') return s.type === 'col' && s.index === i;
        if (edge === 'LEFT' || edge === 'RIGHT') return s.type === 'row' && s.index === i;
        return false;
      });

      if (laneShift && attackerBlock) {
        const firstCell = this.matrixElement?.children[firstCellIdx] as HTMLElement;
        const startRect = attackerBlock.getBoundingClientRect();
        const endRect = firstCell.getBoundingClientRect();
        
        let localDx = endRect.left - startRect.left;
        let localDy = endRect.top - startRect.top;
        if (edge === 'TOP' || edge === 'BOTTOM') {
          localDx = -(endRect.top - startRect.top);
          localDy = (endRect.left - startRect.left);
        }

        const tl = gsap.timeline();
        await tl.to(attackerBlock, { x: localDx * 0.4, y: localDy * 0.4, duration: 0.15, ease: "power2.out" })
                .to(attackerBlock, { x: -localDx * 0.2, y: -localDy * 0.2, duration: 0.25, ease: "elastic.out(1, 0.3)" });

        gsap.to(attackerBlock, { scale: 0, opacity: 0, rotation: (Math.random() - 0.5) * 180, duration: 0.3, ease: "power2.in" });

        gsap.fromTo(firstCell, { filter: 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' }, { filter: 'none', duration: 0.5 });

        // FIX 1: Use the attacker block (from the played card) to calculate penalty
        const attackerType = selectedCard.symbols[i];
        const penaltyVal = Number(SCORE_WEIGHTS[attackerType]) || 0;
        if (penaltyVal > 0) {
          this.showScorePopup(-penaltyVal, firstCellIdx, true);
          visualScore -= penaltyVal;
          const scoreVal = document.getElementById('ui-score');
          if (scoreVal) {
            scoreVal.textContent = Math.floor(visualScore).toString();
            gsap.fromTo(scoreVal, { scale: 1.4, color: "#F44336", x: 5 }, { scale: 1, color: "#FFF", x: 0, duration: 0.3 });
          }
        }

        const laneCells = laneIndices.map(idx => this.matrixElement?.children[idx] as HTMLElement);
        const shiftAmount = (edge === 'TOP' || edge === 'BOTTOM') ? (this.matrixElement!.offsetWidth / 3 + 8) : (this.matrixElement!.offsetHeight / 3 + 8);
        let sx = 0, sy = 0;
        if (laneShift.type === 'row') sx = laneShift.direction * shiftAmount;
        else sy = laneShift.direction * shiftAmount;

        const shiftPromises = laneCells.map(cell => gsap.to(cell, { x: sx, y: sy, duration: 0.4, ease: "power2.inOut", onComplete: () => gsap.set(cell, { x: 0, y: 0 }) }));
        await Promise.all(shiftPromises);
        
        laneIndices.forEach(idx => {
          const r = Math.floor(idx / 3); const c = idx % 3;
          (this.matrixElement?.children[idx] as HTMLImageElement).src = blockAsset(result.newGrid[r][c]);
        });
        continue;
      }

      const laneStartsWinning = result.replacedCells.some(c => c.r === firstCellPos.r && c.c === firstCellPos.c);

      if (laneStartsWinning && attackerBlock) {
        const firstCell = this.matrixElement?.children[firstCellIdx] as HTMLElement;
        if (firstCell) {
          const startRect = attackerBlock.getBoundingClientRect();
          const endRect = firstCell.getBoundingClientRect();
          let localDx = endRect.left - startRect.left;
          let localDy = endRect.top - startRect.top;
          if (edge === 'TOP' || edge === 'BOTTOM') { localDx = -(endRect.top - startRect.top); localDy = (endRect.left - startRect.left); }
          await gsap.to(attackerBlock, { x: localDx, y: localDy, duration: 0.4, ease: "back.inOut(2)" });
        }
      } else if (attackerBlock) {
        gsap.to(attackerBlock, { scale: 0, opacity: 0, rotation: (Math.random() - 0.5) * 180, duration: 0.4, ease: "power2.in" });
        await new Promise(r => setTimeout(r, 200));
      }

      for (let step = 0; step < 3; step++) {
        const index = laneIndices[step];
        const cellPos = { r: Math.floor(index / 3), c: index % 3 };
        if (!result.replacedCells.some(c => c.r === cellPos.r && c.c === cellPos.c)) break;

        const img = this.matrixElement?.children[index] as HTMLImageElement;
        const defenderSymbol = state.matrix.grid[cellPos.r][cellPos.c];
        const gain = SCORE_WEIGHTS[defenderSymbol];

        if (img) {
          const smash = 60; let sx = 0, sy = 0;
          if (edge === 'TOP') sy = -smash; else if (edge === 'BOTTOM') sy = smash;
          else if (edge === 'LEFT') sx = -smash; else if (edge === 'RIGHT') sx = smash;

          img.src = blockAsset(result.newGrid[cellPos.r][cellPos.c]);
          gsap.fromTo(img, 
            { x: sx, y: sy, scale: 2.2, zIndex: 100, filter: 'brightness(3) contrast(1.2) drop-shadow(0 0 30px rgba(255,160,0,1))' },
            { x: 0, y: 0, scale: 1, zIndex: 1, filter: 'brightness(1) contrast(1) drop-shadow(0 0 0px rgba(0,0,0,0))', duration: 0.4, ease: "back.out(2.5)" }
          );

          if (gain > 0) {
            this.showScorePopup(gain, index);
            visualScore += gain;
            const scoreVal = document.getElementById('ui-score');
            if (scoreVal) {
              scoreVal.textContent = visualScore.toString();
              gsap.fromTo(scoreVal, { scale: 1.4, color: "#FF9800", x: -5 }, { scale: 1, color: "#FFF", x: 0, duration: 0.3 });
            }
          }
        }
        await new Promise(r => setTimeout(r, 500));
      }
      await new Promise(r => setTimeout(r, 300));
    }

    await new Promise(r => setTimeout(r, 300));
    this.store.applyClashResult(result);
    this.isAnimating = false;
    this.render();
  }

  private showScorePopup(score: number, matrixIndex: number, isPenalty: boolean = false): void {
    const tile = this.matrixElement?.children[matrixIndex] as HTMLElement;
    if (!tile) return;
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = score > 0 ? `+${score}` : `${score}`;
    if (isPenalty) {
      popup.style.color = '#F44336';
      popup.style.textShadow = '0 0 10px rgba(0,0,0,0.9), 0 0 20px rgba(244, 67, 54, 0.6)';
    }
    document.body.appendChild(popup);
    const rect = tile.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    gsap.set(popup, { left: 0, top: 0, x, y, scale: 0, opacity: 1, xPercent: -50, yPercent: -50 });
    gsap.to(popup, { scale: 1.5, y: y - 100, duration: 0.8, ease: "back.out(2)" });
    gsap.to(popup, { opacity: 0, delay: 0.6, duration: 0.4, onComplete: () => popup.remove() });
  }

  private updateHeldPosition(): void {
    const state = this.store.getState();
    const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];

    // Clear any remaining held classes from cards that are NOT the current selection
    this.handElement?.querySelectorAll('.held').forEach(el => {
      const cardId = el.getAttribute('data-card-id');
      if (cardId !== lastId) {
        el.classList.remove('held');
        (el as HTMLElement).style.left = '';
        (el as HTMLElement).style.top = '';
        gsap.set(el, { clearProps: "all" });
      }
    });

    if (!lastId) return;

    const img = this.handElement?.querySelector(`[data-card-id="${lastId}"]`) as HTMLElement;
    if (!img) return;

    const handRect = this.handElement!.getBoundingClientRect();
    // Stricter threshold: if mouse moves into the top part of the hand area, drop it
    const isAboveHand = this.mouseY < handRect.top + 20;

    if (isAboveHand) {
      if (!img.classList.contains('held')) {
        img.classList.add('held');
        // If multiple cards are selected, enforce only one is picked
        if (state.selectedCardIds.length > 1) {
          this.store.selectCard(lastId); // Re-select only this one to clear others
          this.renderHand(this.store.getState()); // Update hand immediately
        }
      }
      // Force pick position to match mouse using GSAP to avoid any offset from fan animations
      gsap.set(img, { 
        left: this.mouseX, 
        top: this.mouseY, 
        x: 0, 
        y: 0, 
        xPercent: -50, 
        yPercent: -50, 
        rotation: 0,
        opacity: state.preview ? 0 : 1, // Hide if in preview mode
        pointerEvents: state.preview ? 'none' : 'auto'
      });
    } else {
      if (img.classList.contains('held')) {
        img.classList.remove('held');
        img.style.left = ''; img.style.top = '';
        gsap.set(img, { opacity: 1, pointerEvents: 'auto' });
        // Re-render hand to restore GSAP fan positions immediately
        this.renderHand(state);
      }
    }
  }

  private showPileModal(type: 'DECK' | 'DISCARD'): void {
    const state = this.store.getState();
    const cards = type === 'DECK' ? state.deck : state.discardPile;
    const title = type === 'DECK' ? 'Deck' : 'Wasted Cards';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content pile-view">
        <div class="modal-header"><h2>${title} (${cards.length})</h2><button class="close-btn">&times;</button></div>
        <div class="pile-grid">
          ${cards.map(card => `<div class="pile-card-item"><img src="${cardAsset(card).src}"></div>`).join('')}
          ${cards.length === 0 ? '<p style="color:#888; grid-column: 1/-1;">No cards here yet.</p>' : ''}
        </div>
      </div>
    `;
    this.root.appendChild(overlay);
    overlay.querySelector('.close-btn')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  private render(): void {
    const state = this.store.getState();
    const lastPreviewEdge = (this.store as any).storeInternal?.lastPreviewEdge as InsertEdge | null;

    const levelEl = document.getElementById('ui-level'); if (levelEl) levelEl.textContent = `${state.currentLevel}/3`;
    const goalEl = document.getElementById('ui-goal'); if (goalEl) goalEl.textContent = (state.levelGoal || 0).toString();
    const scoreEl = document.getElementById('ui-score'); if (scoreEl) scoreEl.textContent = (state.currentScore || 0).toString();
    const goldEl = document.getElementById('ui-gold'); if (goldEl) goldEl.textContent = (state.gold || 0).toString();

    const shuffleBtn = document.getElementById('ui-btn-shuffle');
    if (shuffleBtn) {
      shuffleBtn.querySelector('.val')!.textContent = state.shufflesLeft.toString();
      state.shufflesLeft <= 0 || state.status !== 'PLAYING' ? shuffleBtn.classList.add('disabled') : shuffleBtn.classList.remove('disabled');
    }
    const deckIcon = document.getElementById('ui-deck-pile'); if (deckIcon) deckIcon.onclick = () => this.showPileModal('DECK');
    const discardIcon = document.getElementById('ui-discard-pile'); if (discardIcon) discardIcon.onclick = () => this.showPileModal('DISCARD');
    const dealBtn = document.getElementById('ui-btn-deal');
    if (dealBtn) {
      dealBtn.querySelector('.val')!.textContent = state.dealsLeft.toString();
      (state.dealsLeft <= 0 || state.status !== 'PLAYING' || state.deck.length === 0) ? dealBtn.classList.add('disabled') : dealBtn.classList.remove('disabled');
    }
    (document.getElementById('ui-btn-rotate') as HTMLButtonElement).disabled = state.selectedCardIds.length === 0;
    const deckCountEl = document.getElementById('ui-deck-count'); if (deckCountEl) deckCountEl.textContent = state.deck.length.toString();
    const discardCountEl = document.getElementById('ui-discard-count'); if (discardCountEl) discardCountEl.textContent = state.discardPile.length.toString();

    const clashScoreEl = document.getElementById('ui-clash-score');
    if (clashScoreEl) {
      if (state.preview && !this.isAnimating) clashScoreEl.textContent = 'LANE CLASH';
      else if (state.preview && this.isAnimating) clashScoreEl.innerHTML = `GAIN: <span style="color: var(--orange-accent)">+${state.preview.scoreDelta}</span>`;
      else clashScoreEl.textContent = 'LANE CLASH';
    }

    if (this.matrixWrapperElement) {
      this.matrixWrapperElement.className = `matrix-wrapper ${state.selectedCardIds.length > 0 ? 'state-pick' : ''} ${state.preview ? 'state-preview' : ''}`;
      if (this.previewBoxElement) this.previewBoxElement.className = `preview-box preview-${lastPreviewEdge?.toLowerCase() || ''}`;
    }

    if (this.matrixElement) {
      this.matrixElement.innerHTML = '';
      const gridToRender = state.matrix.grid;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const img = document.createElement('img');
          img.src = blockAsset(gridToRender[r][c]);
          if (state.preview) {
            if (state.preview.replacedCells.some(cell => cell.r === r && cell.c === c)) img.style.filter = 'drop-shadow(0 0 5px rgba(255, 152, 0, 0.4))';
          }
          this.matrixElement.appendChild(img);
        }
      }
    }

    EDGE_ORDER.forEach(edge => {
      const dz = this.matrixWrapperElement?.querySelector(`.drop-zone-${edge.toLowerCase()}`) as HTMLElement;
      if (!dz) return; dz.innerHTML = '';
      if (state.preview && lastPreviewEdge === edge) {
        const selectedCard = state.hand.find(c => c.id === state.selectedCardIds[state.selectedCardIds.length - 1]);
        if (selectedCard) {
          const cardContainer = document.createElement('div');
          selectedCard.symbols.forEach(s => { const img = document.createElement('img'); img.src = blockAsset(s); cardContainer.appendChild(img); });
          dz.appendChild(cardContainer);
        }
      }
    });

    this.renderHand(state);
    this.updateHeldPosition();

    let overlay = this.root.querySelector('.modal-overlay');
    if (state.status === 'CHOOSE_DECK') {
      if (!overlay) {
        overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        overlay.innerHTML = `
          <div class="modal-content deck-selector">
            <h1>Choose Your Deck</h1>
            <div class="deck-options">
              <div class="deck-option" data-type="1"><h3>Balanced</h3><div class="preview-cards"><img src="Sketch/CardType=100.png"><img src="Sketch/CardType=300.png"><img src="Sketch/CardType=400.png"></div></div>
              <div class="deck-option" data-type="2"><h3>Multi-hit</h3><div class="preview-cards"><img src="Sketch/CardType=110.png"><img src="Sketch/CardType=330.png"><img src="Sketch/CardType=440.png"></div></div>
              <div class="deck-option" data-type="3"><h3>Hardcore</h3><div class="preview-cards"><img src="Sketch/CardType=111.png"><img src="Sketch/CardType=333.png"><img src="Sketch/CardType=444.png"></div></div>
            </div>
          </div>
        `;
        this.root.appendChild(overlay);
        overlay.querySelectorAll('.deck-option').forEach(opt => opt.addEventListener('click', () => {
          this.store.chooseDeck(parseInt(opt.getAttribute('data-type') || '1'));
          this.render();
        }));
      }
    } else if (state.status === 'LEVEL_WON') {
      if (!overlay) {
        overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        overlay.innerHTML = `<div class="modal-content" style="background:#2F3F45; padding:40px; border-radius:12px; text-align:center;"><h1 style="color:#4CAF50;">LEVEL COMPLETE!</h1><p style="font-size:1.5rem; margin:20px 0; color:#FFD700;">Reward: GOLD +25</p><button id="next-btn" style="padding:15px 30px; font-size:1.2rem; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">NEXT LEVEL</button></div>`;
        this.root.appendChild(overlay);
        overlay.querySelector('#next-btn')?.addEventListener('click', () => { this.store.nextLevel(); this.render(); });
      }
    } else if (state.status === 'WIN') {
      if (!overlay) {
        overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        overlay.innerHTML = `<div class="modal-content" style="background:#2F3F45; padding:40px; border-radius:12px; text-align:center;"><h1 style="color:#FFD700;">CONGRATULATIONS!</h1><p style="font-size:1.5rem; margin:20px 0; color:#FFD700;">You conquered all 3 levels!</p><p style="font-size:1.2rem; color:white;">Final Gold: ${state.gold}</p><button id="restart-btn" style="padding:15px 30px; font-size:1.2rem; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">New Game</button></div>`;
        this.root.appendChild(overlay);
        overlay.querySelector('#restart-btn')?.addEventListener('click', () => { this.store.resetGame(); this.render(); });
      }
    } else if (state.status === 'GAME_OVER') {
      if (!overlay) {
        overlay = document.createElement('div'); overlay.className = 'modal-overlay';
        overlay.innerHTML = `<div class="modal-content" style="background:#2F3F45; padding:40px; border-radius:12px; text-align:center;"><h1>Game Over</h1><p id="final-score-text" style="font-size:1.5rem; margin:20px 0; color:#FFC107;"></p><button id="restart-btn" style="padding:15px 30px; font-size:1.2rem; background:#F44336; color:white; border:none; border-radius:8px; cursor:pointer;">Try Again</button></div>`;
        this.root.appendChild(overlay);
        overlay.querySelector('#restart-btn')?.addEventListener('click', () => { this.store.resetGame(); this.render(); });
      }
      (overlay.querySelector('#final-score-text') as HTMLElement).textContent = `Final Score: ${state.currentScore}`;
    } else if (overlay) {
      overlay.remove();
    }
  }

  private renderHand(state: any): void {
    if (!this.handElement) return;
    Array.from(this.handElement.children).forEach(el => { 
      if (!state.hand.find((c: any) => c.id === el.getAttribute('data-card-id'))) el.remove(); 
    });

    state.hand.forEach((card: any, index: number) => {
      let img = this.handElement!.querySelector(`[data-card-id="${card.id}"]`) as HTMLImageElement;
      if (!img) {
        img = document.createElement('img'); img.className = 'card-asset'; img.setAttribute('data-card-id', card.id);
        img.addEventListener('click', (e) => { 
          e.stopPropagation(); 
          if (this.isAnimating) return; 
          this.store.selectCard(card.id); 
          this.render(); 
        });
        this.handElement!.appendChild(img);
      }
      const asset = cardAsset(card); img.src = asset.src;
      
      const isSelected = state.selectedCardIds.includes(card.id);
      const isLastSelected = state.selectedCardIds[state.selectedCardIds.length - 1] === card.id;
      
      if (isSelected) img.classList.add('selected'); else img.classList.remove('selected');
      
      const total = state.hand.length; 
      const spread = 85; 
      const angleStep = 4; 
      const mid = (total - 1) / 2; const offset = index - mid;
      const fanX = offset * spread; 
      const fanY = Math.abs(offset) * 5; 
      const angle = offset * angleStep;

      if (!img.classList.contains('held')) {
        gsap.to(img, { 
          rotation: angle + (asset.rotate ? 180 : 0), 
          x: fanX, 
          y: fanY, 
          xPercent: -50, 
          yPercent: 0, 
          transformOrigin: "50% 50%", 
          zIndex: isSelected ? (isLastSelected ? 1100 : 1000 + index) : index, 
          duration: 0.4, 
          ease: "power2.out" 
        });
      }
    });
  }
}
