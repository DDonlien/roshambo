import { GameStore } from './state';
import { GameUI } from './ui';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Root element #app not found.');
}

const store = new GameStore({ initialTargetScore: 150 });
const ui = new GameUI(store, root);
ui.mount();
