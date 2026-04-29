import { GameStore } from './state';
import { CARD_LENGTH, Card, GameState, InsertEdge, LevelIcon, RPS } from './types';
import { gsap } from 'gsap';

type Lang = 'EN' | 'ZH' | 'ZH_TW' | 'JA';

function getDefaultLang(): Lang {
  const stored = localStorage.getItem('user_lang') as Lang | null;
  if (stored && ['EN', 'ZH', 'ZH_TW', 'JA'].includes(stored)) {
    return stored;
  }

  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const langLower = browserLang.toLowerCase();
  
  if (langLower.startsWith('zh')) {
    if (langLower.includes('tw') || langLower.includes('hk') || langLower.includes('hant')) {
      return 'ZH_TW';
    }
    return 'ZH';
  } else if (langLower.startsWith('ja')) {
    return 'JA';
  }
  return 'EN';
}

let currentLang: Lang = getDefaultLang();

const LANG_DISPLAY: Record<Lang, string> = {
  EN: 'EN',
  ZH: '简',
  ZH_TW: '繁',
  JA: '日'
};

const I18N = {
  EN: {
    STAGE: 'STAGE',
    SCORE: 'SCORE',
    CHIPS: 'CHIPS',
    SHUFFLE_MATRIX: 'SHUFFLE',
    DEAL_CARD: 'DEAL CARD',
    DECK: 'DECK',
    WASTED: 'WASTED',
    END: 'END',
    ROTATE: 'Rotate',
    POCKET: 'Pocket',
    RUBIK: 'Rubik',
    MASTER: 'Master',
    CHOOSE_DECK: 'Choose your deck',
    CHOOSE_SLEEVE: 'Choose your sleeve',
    LEVEL_WON: 'Round Cleared!',
    GAME_OVER: 'Game Over',
    WIN: 'You Win!',
    NEXT_LEVEL: 'Next Level',
    RESTART: 'Restart Game',
    ROUND_REWARD: 'Reward Summary',
    ENTER_SHOP: 'Enter Shop',
    SHOP: 'Shop',
    CONTINUE: 'Continue',
    LEVEL_REWARD: 'Level Reward',
    INTEREST_REWARD: 'Interest',
    TOTAL_REWARD: 'Total',
    TARGET_SCORE: 'TARGET SCORE',
    TOTAL_SCORE: 'TOTAL SCORE',
    BASE_SCORE: 'BASE SCORE',
    MULTIPLIER: 'MULTIPLIER',
    GOLD: 'GOLD',
    SLEEVE: 'SLEEVE',
    GIFT_CARD: 'GIFT CARD',
    PLAYMAT: 'PLAYMAT',
    NONE: 'None',
    MASTER_EFFECT: '+1 Multiplier for every 3 matches made.',
    BUY: 'Buy',
    PURCHASED: 'Purchased',
    SPECIAL_CARDS: 'Special Cards',
    INVENTORY: 'Inventory',
    GIFT_CARDS: 'Gift Cards',
    PLAYMATS: 'Playmats',
    SLEEVES: 'Sleeves',
    USE: 'Use',
    START_LEVEL: 'Start Level',
    PREPARE_LEVEL: 'Prepare Level',
    CHOOSE_ONE: 'Choose 1',
    SKIP: 'Skip',
    FINAL_RUN_CLEAR: 'You cleared all 9 stages and 27 levels!',
    FINAL_CHIPS: 'Final Chips'
  },
  ZH: {
    STAGE: '关卡',
    SCORE: '分数',
    CHIPS: '筹码',
    SHUFFLE_MATRIX: '矩阵洗牌',
    DEAL_CARD: '替换手牌',
    DECK: '牌库',
    WASTED: '弃牌堆',
    END: '结束游戏',
    ROTATE: '翻转',
    POCKET: 'Pocket',
    RUBIK: 'Rubik',
    MASTER: 'Master',
    CHOOSE_DECK: '选择牌组',
    CHOOSE_SLEEVE: '选择初始卡套',
    LEVEL_WON: '关卡完成！',
    GAME_OVER: '游戏结束',
    WIN: '你赢了！',
    NEXT_LEVEL: '下一关',
    RESTART: '重新开始',
    ROUND_REWARD: '奖励结算',
    ENTER_SHOP: '进入商店',
    SHOP: '商店',
    CONTINUE: '继续',
    LEVEL_REWARD: '关卡奖励',
    INTEREST_REWARD: '利息奖励',
    TOTAL_REWARD: '总奖励',
    TARGET_SCORE: '目标分数',
    TOTAL_SCORE: '总分',
    BASE_SCORE: '基础分',
    MULTIPLIER: '倍率',
    GOLD: '金币',
    SLEEVE: '卡套',
    GIFT_CARD: '礼品卡',
    PLAYMAT: '卡垫',
    NONE: '无',
    MASTER_EFFECT: '每达成 3 次匹配，倍率 +1。',
    BUY: '购买',
    PURCHASED: '已购买',
    SPECIAL_CARDS: '特殊牌',
    INVENTORY: '库存',
    GIFT_CARDS: '礼品卡',
    PLAYMATS: '卡垫',
    SLEEVES: '卡套',
    USE: '使用',
    START_LEVEL: '开始本关',
    PREPARE_LEVEL: '关前准备',
    CHOOSE_ONE: '选择 1 个',
    SKIP: '跳过',
    FINAL_RUN_CLEAR: '你已通关全部 9 大关与 27 个关卡！',
    FINAL_CHIPS: '最终筹码'
  },
  ZH_TW: {
    STAGE: '關卡',
    SCORE: '分數',
    CHIPS: '籌碼',
    SHUFFLE_MATRIX: '矩陣洗牌',
    DEAL_CARD: '替換手牌',
    DECK: '牌庫',
    WASTED: '棄牌堆',
    END: '結束遊戲',
    ROTATE: '翻轉',
    POCKET: 'Pocket',
    RUBIK: 'Rubik',
    MASTER: 'Master',
    CHOOSE_DECK: '選擇牌組',
    CHOOSE_SLEEVE: '選擇初始卡套',
    LEVEL_WON: '關卡完成！',
    GAME_OVER: '遊戲結束',
    WIN: '你贏了！',
    NEXT_LEVEL: '下一關',
    RESTART: '重新開始',
    ROUND_REWARD: '獎勵結算',
    ENTER_SHOP: '進入商店',
    SHOP: '商店',
    CONTINUE: '繼續',
    LEVEL_REWARD: '關卡獎勵',
    INTEREST_REWARD: '利息獎勵',
    TOTAL_REWARD: '總獎勵',
    TARGET_SCORE: '目標分數',
    TOTAL_SCORE: '總分',
    BASE_SCORE: '基礎分',
    MULTIPLIER: '倍率',
    GOLD: '金幣',
    SLEEVE: '卡套',
    GIFT_CARD: '禮品卡',
    PLAYMAT: '卡墊',
    NONE: '無',
    MASTER_EFFECT: '每達成 3 次配對，倍率 +1。',
    BUY: '購買',
    PURCHASED: '已購買',
    SPECIAL_CARDS: '特殊牌',
    INVENTORY: '庫存',
    GIFT_CARDS: '禮品卡',
    PLAYMATS: '卡墊',
    SLEEVES: '卡套',
    USE: '使用',
    START_LEVEL: '開始本關',
    PREPARE_LEVEL: '關前準備',
    CHOOSE_ONE: '選擇 1 個',
    SKIP: '跳過',
    FINAL_RUN_CLEAR: '你已通關全部 9 大關與 27 個關卡！',
    FINAL_CHIPS: '最終籌碼'
  },
  JA: {
    STAGE: 'ステージ',
    SCORE: 'スコア',
    CHIPS: 'チップ',
    SHUFFLE_MATRIX: 'シャッフル',
    DEAL_CARD: 'カードを配る',
    DECK: '山札',
    WASTED: '捨て札',
    END: 'ゲーム終了',
    ROTATE: '回転',
    POCKET: 'Pocket',
    RUBIK: 'Rubik',
    MASTER: 'Master',
    CHOOSE_DECK: 'デッキを選択',
    CHOOSE_SLEEVE: '初期スリーブを選択',
    LEVEL_WON: 'ステージクリア！',
    GAME_OVER: 'ゲームオーバー',
    WIN: 'クリア！',
    NEXT_LEVEL: '次のステージ',
    RESTART: 'リスタート',
    ROUND_REWARD: '報酬',
    ENTER_SHOP: 'ショップへ',
    SHOP: 'ショップ',
    CONTINUE: '続ける',
    LEVEL_REWARD: 'ステージ報酬',
    INTEREST_REWARD: '利息',
    TOTAL_REWARD: '合計',
    TARGET_SCORE: '目標スコア',
    TOTAL_SCORE: '合計スコア',
    BASE_SCORE: '基本点',
    MULTIPLIER: '倍率',
    GOLD: 'ゴールド',
    SLEEVE: 'スリーブ',
    GIFT_CARD: 'ギフトカード',
    PLAYMAT: 'プレイマット',
    NONE: 'なし',
    MASTER_EFFECT: '3回マッチするたびに倍率 +1。',
    BUY: '購入',
    PURCHASED: '購入済み',
    SPECIAL_CARDS: '特殊カード',
    INVENTORY: '所持品',
    GIFT_CARDS: 'Gift Card',
    PLAYMATS: 'Playmat',
    SLEEVES: 'Sleeve',
    USE: '使用',
    START_LEVEL: 'この関を開始',
    PREPARE_LEVEL: '開始前準備',
    CHOOSE_ONE: '1つ選ぶ',
    SKIP: 'スキップ',
    FINAL_RUN_CLEAR: '9 ステージ、27 レベルを制覇！',
    FINAL_CHIPS: '最終チップ'
  }
};

const EDGE_ORDER: readonly InsertEdge[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];

const SCORE_WEIGHTS: Record<RPS, number> = {
  [RPS.ROCK]: 4,
  [RPS.SCISSORS]: 3,
  [RPS.PAPER]: 1,
  [RPS.BLANK]: 0,
  [RPS.TRICOLOR]: 2
};

let blockAssetMap: Record<string, string> = {
  'ROCK': 'Rock',
  'SCISSORS': 'Scissors',
  'PAPER': 'Paper',
  'BLANK': 'Blank',
  'TRICOLOR': 'Tricolor'
};

// Initial fallback map just in case CSV fails to load
let cardAssetMap: Record<string, string> = {};

export async function loadAssetMaps(): Promise<void> {
  try {
    const [blockRes, cardRes] = await Promise.all([
      fetch('/definition/blockasset.csv'),
      fetch('/definition/cardasset.csv')
    ]);
    
    if (blockRes.ok) {
      const text = await blockRes.text();
      text.split('\n').forEach(line => {
        const [k, v] = line.trim().split(',');
        if (k && v) blockAssetMap[k] = v;
      });
    }
    
    if (cardRes.ok) {
      const text = await cardRes.text();
      text.split('\n').forEach(line => {
        const [k, v] = line.trim().split(',');
        if (k && v) cardAssetMap[k] = v;
      });
    }
  } catch (e) {
    console.warn('Failed to load asset maps, using defaults', e);
  }
}

function getCardFullAsset(card: Card): string {
  // We need to construct the 3-digit code from the card symbols to lookup in cardAssetMap
  const mapToDigit: Record<string, string> = {
    'ROCK': '4',
    'SCISSORS': '3',
    'PAPER': '1',
    'BLANK': '0',
    'TRICOLOR': '7'
  };

  // Always get the base un-flipped symbols to map to the single physical asset file
  const baseSymbols = card.isFlipped ? [...card.symbols].reverse() : card.symbols;
  
  // The symbols array is top-to-bottom.
  // The code for a card is generated by reading its symbols from top to bottom.
  // Example: Top=ROCK(4), Mid=BLANK(0), Bottom=BLANK(0) => code "400"
  const code = baseSymbols.map(s => mapToDigit[s] || '0').join('');
  
  // Look up the full path in the CSV map.
  return cardAssetMap[code] || `/Sketch/CardType=${code}.png`;
}

function hasFullCardAsset(card: Card): boolean {
  const mapToDigit: Record<string, string> = {
    ROCK: '4',
    SCISSORS: '3',
    PAPER: '1',
    BLANK: '0',
    TRICOLOR: '7'
  };
  const baseSymbols = card.isFlipped ? [...card.symbols].reverse() : card.symbols;
  const code = baseSymbols.map((symbol) => mapToDigit[symbol] || '0').join('');
  return Boolean(cardAssetMap[code]);
}

function hasTricolor(card: Card): boolean {
  return card.symbols.includes(RPS.TRICOLOR);
}

function tricolorDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5252"/><stop offset="0.5" stop-color="#4fc3f7"/><stop offset="1" stop-color="#81c784"/></linearGradient></defs><rect x="6" y="6" width="88" height="88" rx="14" fill="rgba(0,0,0,0.15)" stroke="url(#g)" stroke-width="6"/><path d="M50 18 L82 74 H18 Z" fill="#ff5252" opacity="0.78"/><path d="M18 30 L82 30 L50 86 Z" fill="#4fc3f7" opacity="0.6"/><circle cx="50" cy="50" r="16" fill="#81c784" opacity="0.72"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function blockAsset(symbol: RPS): string {
  if (symbol === RPS.TRICOLOR) {
    return tricolorDataUrl();
  }
  // Look up the full path in the CSV map.
  return blockAssetMap[symbol] || `/Sketch/BlockType=Blank.png`;
}

function iconAsset(icon: LevelIcon): string {
  return `/Sketch/icon_${icon}.png`;
}

function cardClassName(isHandCard: boolean): string {
  return `render-card${isHandCard ? ' card-asset' : ''}`;
}

type CardOrientation = 'vertical' | 'horizontal';

function createCardElement(
  card: Card,
  extraClass = '',
  orientation: CardOrientation = 'vertical',
  isHandCard = false
): HTMLDivElement {
  const element = document.createElement('div');
  element.className = `${cardClassName(isHandCard)} ${orientation === 'horizontal' ? 'render-card-horizontal' : ''} ${extraClass}`.trim();
  element.style.setProperty('--card-block-count', String(card.symbols.length));
  
  if ((isHandCard || extraClass.includes('modal-card')) && !hasTricolor(card) && hasFullCardAsset(card)) {
    element.classList.add('full-asset');
    const image = document.createElement('img');
    image.className = 'card-full-image';
    image.src = getCardFullAsset(card);
    element.appendChild(image);
  } else {
    card.symbols.forEach((symbol) => {
      const image = document.createElement('img');
      image.className = 'card-block';
      image.src = blockAsset(symbol);
      element.appendChild(image);
    });
  }
  return element;
}

function createCardMarkup(card: Card): string {
  if (hasTricolor(card) || !hasFullCardAsset(card)) {
    const blocks = card.symbols.map((symbol) => `<img class="card-block" src="${blockAsset(symbol)}">`).join('');
    return `
      <div class="render-card modal-card" style="--card-block-count:${card.symbols.length}">
        ${blocks}
      </div>
    `;
  }
  return `
    <div class="render-card modal-card full-asset" style="--card-block-count:${card.symbols.length}">
      <img class="card-full-image" src="${getCardFullAsset(card)}">
    </div>
  `;
}

function createSpecialCardMarkup(
  name: string,
  shortName: string,
  description: string,
  accent: string,
  extraClass = ''
): string {
  return `
    <div class="special-card ${extraClass}" style="--special-accent:${accent}">
      <div class="special-card-name">${name}</div>
      <div class="special-card-short">${shortName}</div>
      <div class="special-card-desc">${description}</div>
    </div>
  `;
}

const FALLBACK_TEXT_I18N: Record<string, Partial<Record<Lang, string>>> = {
  Joker: { ZH: '小丑', ZH_TW: '小丑', JA: 'ジョーカー' },
  Jkr: { ZH: '小丑', ZH_TW: '小丑', JA: 'Jkr' },
  'Greedy Joker': { ZH: '贪婪小丑', ZH_TW: '貪婪小丑', JA: '欲張りジョーカー' },
  Grd: { ZH: '贪婪', ZH_TW: '貪婪', JA: '欲張' },
  'Lusty Joker': { ZH: '欲念小丑', ZH_TW: '慾念小丑', JA: '色欲ジョーカー' },
  Lst: { ZH: '欲念', ZH_TW: '慾念', JA: '色欲' },
  'Wrathful Joker': { ZH: '愤怒小丑', ZH_TW: '憤怒小丑', JA: '憤怒ジョーカー' },
  Wrt: { ZH: '愤怒', ZH_TW: '憤怒', JA: '憤怒' },
  'Gluttonous Joker': { ZH: '暴食小丑', ZH_TW: '暴食小丑', JA: '暴食ジョーカー' },
  Glt: { ZH: '暴食', ZH_TW: '暴食', JA: '暴食' },
  'Jolly Joker': { ZH: '快活小丑', ZH_TW: '快活小丑', JA: '陽気ジョーカー' },
  Jly: { ZH: '快活', ZH_TW: '快活', JA: '陽気' },
  'Zany Joker': { ZH: '古怪小丑', ZH_TW: '古怪小丑', JA: '奇妙ジョーカー' },
  Zny: { ZH: '古怪', ZH_TW: '古怪', JA: '奇妙' },
  'Crazy Joker': { ZH: '疯狂小丑', ZH_TW: '瘋狂小丑', JA: '狂気ジョーカー' },
  Crz: { ZH: '疯狂', ZH_TW: '瘋狂', JA: '狂気' },
  'Droll Joker': { ZH: '滑稽小丑', ZH_TW: '滑稽小丑', JA: 'おどけジョーカー' },
  Drl: { ZH: '滑稽', ZH_TW: '滑稽', JA: '滑稽' },
  'Sly Joker': { ZH: '狡黠小丑', ZH_TW: '狡黠小丑', JA: '狡猾ジョーカー' },
  Sly: { ZH: '狡黠', ZH_TW: '狡黠', JA: '狡猾' },
  'Wily Joker': { ZH: '机敏小丑', ZH_TW: '機敏小丑', JA: '策士ジョーカー' },
  Wily: { ZH: '机敏', ZH_TW: '機敏', JA: '策士' },
  Wly: { ZH: '机敏', ZH_TW: '機敏', JA: '策士' },
  'Devious Joker': { ZH: '诡计小丑', ZH_TW: '詭計小丑', JA: '悪知恵ジョーカー' },
  Dev: { ZH: '诡计', ZH_TW: '詭計', JA: '悪知' },
  'Crafty Joker': { ZH: '巧手小丑', ZH_TW: '巧手小丑', JA: '技巧ジョーカー' },
  Crf: { ZH: '巧手', ZH_TW: '巧手', JA: '技巧' },
  'Half Joker': { ZH: '半张小丑', ZH_TW: '半張小丑', JA: 'ハーフジョーカー' },
  Half: { ZH: '半张', ZH_TW: '半張', JA: '半分' },
  'Joker Stencil': { ZH: '小丑模板', ZH_TW: '小丑模板', JA: 'ジョーカーステンシル' },
  Stencil: { ZH: '模板', ZH_TW: '模板', JA: '型紙' },
  Sten: { ZH: '模板', ZH_TW: '模板', JA: '型紙' },
  Banner: { ZH: '旗帜', ZH_TW: '旗幟', JA: '旗印' },
  Bnr: { ZH: '旗帜', ZH_TW: '旗幟', JA: '旗印' },
  'Mystic Summit': { ZH: '神秘峰顶', ZH_TW: '神秘峰頂', JA: '神秘の頂' },
  Summit: { ZH: '峰顶', ZH_TW: '峰頂', JA: '頂' },
  'Loyalty Card': { ZH: '忠诚卡', ZH_TW: '忠誠卡', JA: 'ロイヤルティカード' },
  Loyalty: { ZH: '忠诚', ZH_TW: '忠誠', JA: '忠誠' },
  Loyal: { ZH: '忠诚', ZH_TW: '忠誠', JA: '忠誠' },
  Misprint: { ZH: '错印', ZH_TW: '錯印', JA: 'ミスプリント' },
  Rand: { ZH: '随机', ZH_TW: '隨機', JA: 'ランダム' },
  Abstract: { ZH: '抽象', ZH_TW: '抽象', JA: '抽象' },
  'Abstract Joker': { ZH: '抽象小丑', ZH_TW: '抽象小丑', JA: '抽象ジョーカー' },
  Abs: { ZH: '抽象', ZH_TW: '抽象', JA: '抽象' },
  Runner: { ZH: '跑者', ZH_TW: '跑者', JA: 'ランナー' },
  Run: { ZH: '跑者', ZH_TW: '跑者', JA: '走者' },
  'Blue Joker': { ZH: '蓝色小丑', ZH_TW: '藍色小丑', JA: '青ジョーカー' },
  Blue: { ZH: '蓝色', ZH_TW: '藍色', JA: '青' },
  Drunkard: { ZH: '醉汉', ZH_TW: '醉漢', JA: '酔いどれ' },
  Drnk: { ZH: '醉汉', ZH_TW: '醉漢', JA: '酔い' },
  'Golden Joker': { ZH: '黄金小丑', ZH_TW: '黃金小丑', JA: '黄金ジョーカー' },
  Golden: { ZH: '黄金', ZH_TW: '黃金', JA: '黄金' },
  Gold: { ZH: '黄金', ZH_TW: '黃金', JA: '黄金' },
  Bull: { ZH: '公牛', ZH_TW: '公牛', JA: '雄牛' },
  'To the Moon': { ZH: '奔向月球', ZH_TW: '奔向月球', JA: '月まで' },
  Moon: { ZH: '月球', ZH_TW: '月球', JA: '月' },
  Acrobat: { ZH: '杂技演员', ZH_TW: '雜技演員', JA: '曲芸師' },
  Acro: { ZH: '杂技', ZH_TW: '雜技', JA: '曲芸' },
  'Rough Gem': { ZH: '粗糙宝石', ZH_TW: '粗糙寶石', JA: '原石' },
  Gem: { ZH: '宝石', ZH_TW: '寶石', JA: '宝石' },
  Bloodstone: { ZH: '血石', ZH_TW: '血石', JA: '血石' },
  Blood: { ZH: '血石', ZH_TW: '血石', JA: '血石' },
  Arrowhead: { ZH: '箭头', ZH_TW: '箭頭', JA: '矢じり' },
  Arrow: { ZH: '箭头', ZH_TW: '箭頭', JA: '矢' },
  'Onyx Agate': { ZH: '缟玛瑙', ZH_TW: '縞瑪瑙', JA: 'オニキス' },
  Onyx: { ZH: '缟玛瑙', ZH_TW: '縞瑪瑙', JA: 'オニキス' },
  Agate: { ZH: '玛瑙', ZH_TW: '瑪瑙', JA: '瑪瑙' },
  'Seeing Double': { ZH: '双重视野', ZH_TW: '雙重視野', JA: '二重視' },
  Double: { ZH: '双重', ZH_TW: '雙重', JA: '二重' },
  'The Duo': { ZH: '二重奏', ZH_TW: '二重奏', JA: 'デュオ' },
  Duo: { ZH: '二重', ZH_TW: '二重', JA: 'デュオ' },
  'The Trio': { ZH: '三重奏', ZH_TW: '三重奏', JA: 'トリオ' },
  Trio: { ZH: '三重', ZH_TW: '三重', JA: 'トリオ' },
  'The Order': { ZH: '秩序', ZH_TW: '秩序', JA: '秩序' },
  Order: { ZH: '秩序', ZH_TW: '秩序', JA: '秩序' },
  'The Tribe': { ZH: '部族', ZH_TW: '部族', JA: '部族' },
  Tribe: { ZH: '部族', ZH_TW: '部族', JA: '部族' },
  Bootstraps: { ZH: '鞋带', ZH_TW: '鞋帶', JA: 'ブートストラップ' },
  Boot: { ZH: '鞋带', ZH_TW: '鞋帶', JA: 'ブート' }
};

function localizeText(base: string, i18n?: Partial<Record<Lang, string>>): string {
  return i18n?.[currentLang] ?? i18n?.EN ?? FALLBACK_TEXT_I18N[base]?.[currentLang] ?? base;
}

export class GameUI {
  private matrixWrapperElement: HTMLElement | null = null;
  private matrixElement: HTMLElement | null = null;
  private previewBoxElement: HTMLElement | null = null;
  private handElement: HTMLElement | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isAnimating: boolean = false;
  private lastWheelDirection: -1 | 0 | 1 = 0;
  private lastWheelAt = 0;
  private deckSelectIndex = 0;
  
  // Follow cursor state
  private isHovering = false;
  private currentCardX = 0;
  private currentCardY = 0;

  constructor(private readonly store: GameStore, private readonly root: HTMLElement) {}

  mount(): void {
    this.initialRender();
  }

  private getPointerRatioForEdge(edge: InsertEdge, event: MouseEvent): number {
    const rect = this.matrixWrapperElement?.getBoundingClientRect();
    if (!rect) {
      return 0.5;
    }

    if (edge === 'TOP' || edge === 'BOTTOM') {
      return (event.clientX - rect.left) / rect.width;
    }

    return (event.clientY - rect.top) / rect.height;
  }

  private updateEdgePreview(edge: InsertEdge, event: MouseEvent, zone: HTMLElement): void {
    if (this.isAnimating) return;
    const state = this.store.getState();
    if (state.selectedCardIds.length === 0) return;
    if (!zone.matches(':hover')) return;
    this.store.updatePreview(edge, this.getPointerRatioForEdge(edge, event));
    this.render();
  }

  private getCellMetrics(size: number): { cellSize: number; gap: number; stride: number } {
    if (!this.matrixElement) {
      return { cellSize: 0, gap: 0, stride: 0 };
    }

    const gap = parseFloat(getComputedStyle(this.matrixElement).gap || '0');
    const cellSize = (this.matrixElement.offsetWidth - gap * (size - 1)) / size;
    return {
      cellSize,
      gap,
      stride: cellSize + gap
    };
  }

  private isInsideSafeZone(): boolean {
    const sidebar = document.querySelector('.sidebar');
    const bottomArea = document.querySelector('.bottom-area');
    
    if (sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      if (this.mouseX <= sidebarRect.right) {
        return true;
      }
    }
    
    if (bottomArea) {
      const bottomRect = bottomArea.getBoundingClientRect();
      // Added a slight buffer (e.g., 20px) above the bottom area
      if (this.mouseY >= bottomRect.top - 20) {
        return true;
      }
    }
    
    return false;
  }

  private initialRender(): void {
    this.root.innerHTML = '';

    document.addEventListener('mousedown', (e) => {
      const state = this.store.getState();
      if (state.selectedCardIds.length > 0) {
        const target = e.target as HTMLElement;
        const isCard = target.closest('.card-asset');
        const isDropZone = target.closest('.drop-zone') || target.closest('.preview-box');
        const isButton = target.closest('button') || target.closest('.deck-btn');
        if (!isCard && !isDropZone && !isButton) {
          const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];
          const cardElement = this.handElement?.querySelector(`[data-card-id="${lastId}"]`) as HTMLElement | null;
          if (cardElement) {
            cardElement.classList.remove('held');
            cardElement.style.left = '';
            cardElement.style.top = '';
            gsap.killTweensOf(cardElement);
            // DO NOT clearProps 'all' here! It removes all inline styles and causes jumps.
            // Just clear the specific 3D properties we added during follow/tilt.
            gsap.set(cardElement, { 
              clearProps: 'xPercent,yPercent,rotationX,rotationY,transformPerspective,opacity,pointerEvents' 
            });
          }
          this.isHovering = false;
          this.currentCardX = 0;
          this.currentCardY = 0;
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
      <div class="sidebar-header">
        <div class="sidebar-title">ROSHAMBO</div>
        <button class="btn-lang" id="ui-btn-lang" title="Switch Language">${LANG_DISPLAY[currentLang]}</button>
      </div>
      <div class="stage-box">
        <div class="stage-icon-frame">
          <img id="ui-level-icon" class="stage-icon" src="${iconAsset('pocket')}" alt="stage">
        </div>
        <div class="stage-copy">
          <span class="stage-label" id="ui-level">STAGE 1/9</span>
          <span class="goal-label" id="ui-target-score-label">TARGET SCORE</span>
          <span class="stage-goal" id="ui-goal">10</span>
          <span class="stage-name" id="ui-level-name">Pocket</span>
          <span class="stage-effect" id="ui-stage-effect"></span>
        </div>
      </div>
      <div class="score-box total-score-box" id="ui-total-score-panel">
        <span class="label" id="ui-score-label">TOTAL SCORE</span>
        <span class="value score-ratio"><span id="ui-score">0</span><span class="score-separator">/</span><span id="ui-goal-inline">10</span></span>
      </div>
      <div class="score-split-box">
        <div class="score-split-cell">
          <span class="label" id="ui-base-score-label">BASE SCORE</span>
          <span class="value" id="ui-base-score">0</span>
        </div>
        <div class="score-times">×</div>
        <div class="score-split-cell">
          <span class="label" id="ui-multiplier-label">MULTIPLIER</span>
          <span class="value multiplier-value" id="ui-score-multiplier">1</span>
        </div>
      </div>
      <div class="score-box chips-box" id="ui-chips-box">
        <span class="label chips-label" id="ui-chips-label">GOLD</span>
        <div class="chips-value-wrap">
          <span class="value chips-value" id="ui-chips">10</span>
          <span class="interest-preview" id="ui-interest-preview">+2</span>
        </div>
      </div>
      <div class="deck-actions">
        <div class="deck-btn" id="ui-btn-shuffle">
          <span class="label" id="ui-shuffle-label">SHUFFLE</span>
          <div class="val-box"><span class="val blue" id="ui-shuffle-count">4</span><span class="val-max"> / 4</span></div>
        </div>
        <div class="deck-btn" id="ui-btn-deal">
          <span class="label" id="ui-deal-label">DEAL CARD</span>
          <div class="val-box"><span class="val red" id="ui-deal-count">4</span><span class="val-max"> / 4</span></div>
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
    relics.id = 'ui-special-cards';
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
      
      const visual = document.createElement('div');
      visual.className = 'drop-zone-visual';
      dz.appendChild(visual);
      
      dz.addEventListener('mouseenter', (event) => {
        this.updateEdgePreview(edge, event, dz);
      });

      dz.addEventListener('mousemove', (event) => {
        this.updateEdgePreview(edge, event, dz);
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
      const lastEdge = this.store.getLastPreviewEdge();
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

    const langBtn = this.root.querySelector('#ui-btn-lang');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        if (currentLang === 'EN') currentLang = 'ZH';
        else if (currentLang === 'ZH') currentLang = 'ZH_TW';
        else if (currentLang === 'ZH_TW') currentLang = 'JA';
        else currentLang = 'EN';
        
        localStorage.setItem('user_lang', currentLang);
        langBtn.textContent = LANG_DISPLAY[currentLang];
        this.render();
      });
    }

    window.addEventListener('resize', () => this.render());
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      const state = this.store.getState();
      const hasSelectedCard = state.selectedCardIds.length > 0;
      const shouldReturnToHand = this.isInsideSafeZone();

      // Only act as hovering if we have a card AND we are outside the safe zone (i.e. in the matrix area)
      if (hasSelectedCard && !shouldReturnToHand) {
        if (!this.isHovering) {
          // Snap initial target to mouse immediately upon entering hover state
          const r = this.matrixWrapperElement?.getBoundingClientRect();
          if (r) {
             this.currentCardX = e.clientX - r.left - r.width / 2;
             this.currentCardY = e.clientY - r.top - r.height / 2;
          }
        }
        this.isHovering = true;
      } else {
        if (this.isHovering) {
           this.isHovering = false;
           // If we transition out of hovering, force an immediate render to snap it back to hand
           this.render();
        }
      }
    });
    window.addEventListener('wheel', (e) => {
      const state = this.store.getState();
      if (this.isAnimating || state.selectedCardIds.length === 0) return;
      e.preventDefault();
      const now = performance.now();
      const direction = e.deltaY === 0 ? 0 : (e.deltaY > 0 ? 1 : -1);
      const pausedLongEnough = now - this.lastWheelAt >= 500;
      const directionChanged = direction !== 0 && direction !== this.lastWheelDirection;
      const shouldFlip = direction !== 0 && (pausedLongEnough || directionChanged);

      this.lastWheelAt = now;

      if (!shouldFlip) return;
      this.lastWheelDirection = direction;

      this.store.flipSelectedCard();
      this.render();
    }, { passive: false });

    this.render();

    // Start GSAP Ticker for smooth lagging tilt follow
    gsap.ticker.add(this.updateFollower);
  }

  private updateFollower = (): void => {
    const state = this.store.getState();
    const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];
    if (!lastId || this.isAnimating || !this.handElement) return;

    const cardElement = this.handElement.querySelector(`[data-card-id="${lastId}"]`) as HTMLElement;
    if (!cardElement || !cardElement.classList.contains('held')) return;
    
    if (state.preview) {
      gsap.set(cardElement, { opacity: 1 });
      return;
    }

    const r = this.matrixWrapperElement?.getBoundingClientRect();
    if (!r) return;

    if (!this.isHovering) {
      // If we are not hovering, we want the ticker to stop controlling this card
      // so it can naturally tween back to the hand via render()
      return;
    }

    // Target is mouse relative to matrix center
    let targetX = this.mouseX - r.left - r.width / 2;
    let targetY = this.mouseY - r.top - r.height / 2;

    // LERP to target
    this.currentCardX += (targetX - this.currentCardX) * 0.15;
    this.currentCardY += (targetY - this.currentCardY) * 0.15;

    // Calculate delta for tilt
    const dx = targetX - this.currentCardX;
    const dy = targetY - this.currentCardY;

    // TILT math
    let rotY = dx * 0.4;
    let rotX = -dy * 0.4;

    // Clamp tilt
    rotY = gsap.utils.clamp(-30, 30, rotY);
    rotX = gsap.utils.clamp(-30, 30, rotX);
    
    // If card is rotated (flipped manually via button or scroll wheel)
    // we still need to preserve its Z rotation logic
    const baseRotation = cardElement.classList.contains('render-card-horizontal') ? -90 : 0;
    const isFlipped = state.hand.find(c => c.id === lastId)?.isFlipped;
    const extraZ = isFlipped ? 180 : 0;

    gsap.set(cardElement, {
      left: r.left + r.width / 2,
      top: r.top + r.height / 2,
      x: this.currentCardX,
      y: this.currentCardY,
      rotationX: rotX,
      rotationY: rotY,
      rotationZ: baseRotation + extraZ,
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      pointerEvents: 'none',
      transformPerspective: 800 // Give the tilt a 3D feel
    });
  }

  private async handleClash(edge: InsertEdge): Promise<void> {
    if (this.isAnimating) return;

    const state = this.store.getState();
    const size = state.matrix.size;
    const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];
    const selectedCard = state.hand.find((card) => card.id === lastId);
    if (!selectedCard) return;

    const result = this.store.playSelectedToEdge(edge);
    if (!result) return;

    this.isAnimating = true;
    try {
      const previewBox = this.previewBoxElement;
      const dzBlocks = previewBox ? Array.from(previewBox.querySelectorAll('.card-block')) as HTMLElement[] : [];
      const buildLaneIndices = (laneIndex: number): number[] => {
        const indices: number[] = [];
        for (let step = 0; step < size; step += 1) {
          let r = 0, c = 0;
          if (edge === 'TOP') { r = step; c = laneIndex; }
          else if (edge === 'BOTTOM') { r = size - 1 - step; c = laneIndex; }
          else if (edge === 'LEFT') { r = laneIndex; c = step; }
          else if (edge === 'RIGHT') { r = laneIndex; c = size - 1 - step; }
          indices.push(r * size + c);
        }
        return indices;
      };

      const { stride } = this.getCellMetrics(size);
      const clashTiming = {
        vanish: 0.22,
        shakeStep: 0.04,
        impact: 0.42,
        shift: 0.3,
        scorePause: 300,
        lanePause: 160,
        failPause: 320,
        settlePause: 180
      };

      let currentRoundBase = 0;
      let currentPierce = 0;
      let isFirstScore = true;
      
      const roundScoreBox = document.querySelector('.score-split-box') as HTMLElement | null;
      const baseEl = document.getElementById('ui-base-score');
      const multEl = document.getElementById('ui-score-multiplier');

      if (roundScoreBox && baseEl && multEl) {
        baseEl.textContent = '0';
        multEl.textContent = '1';
        gsap.set(baseEl, { opacity: 1, scale: 1 });
        gsap.set(multEl, { opacity: 1, scale: 1 });
      }

      for (let cardIndex = 0; cardIndex < selectedCard.symbols.length; cardIndex += 1) {
        const laneIndex = result.attachmentOffset + cardIndex;
        const attackerBlock = dzBlocks[cardIndex];

        if (laneIndex < 0 || laneIndex >= size) {
          if (attackerBlock) {
            await gsap.to(attackerBlock, { scale: 0, opacity: 0, rotation: (Math.random() - 0.5) * 180, duration: clashTiming.vanish, ease: 'power2.in' });
          }
          continue;
        }

        const laneIndices = buildLaneIndices(laneIndex);
        const firstCellIdx = laneIndices[0];
        const firstCellPos = { r: Math.floor(firstCellIdx / size), c: firstCellIdx % size };

        const laneShift = result.shiftedLanes?.find((shift) => {
          if (edge === 'TOP' || edge === 'BOTTOM') return shift.type === 'col' && shift.index === laneIndex;
          if (edge === 'LEFT' || edge === 'RIGHT') return shift.type === 'row' && shift.index === laneIndex;
          return false;
        });

        if (laneShift && attackerBlock) {
          const firstCell = this.matrixElement?.children[firstCellIdx] as HTMLElement;
          const startRect = attackerBlock.getBoundingClientRect();
          const endRect = firstCell.getBoundingClientRect();
          const localDx = endRect.left - startRect.left;
          const localDy = endRect.top - startRect.top;

          const tl = gsap.timeline();
          await tl.to(attackerBlock, { x: localDx * 0.4, y: localDy * 0.4, duration: 0.1, ease: 'power2.out' })
            .to(attackerBlock, { x: -localDx * 0.2, y: -localDy * 0.2, duration: 0.18, ease: 'elastic.out(1, 0.3)' });

          gsap.set(attackerBlock, { rotation: 0 });
          gsap.to(attackerBlock, { scale: 0, opacity: 0, rotation: (Math.random() - 0.5) * 180, duration: clashTiming.vanish, ease: 'power2.in' });

          gsap.fromTo(firstCell, { filter: 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' }, { filter: 'none', duration: 0.34 });

          const attackerType = selectedCard.symbols[cardIndex];
          const penaltyVal = Number(SCORE_WEIGHTS[attackerType]) || 0;
          if (penaltyVal > 0) {
            const popupIndex = firstCellIdx;
            const popupTile = this.matrixElement?.children[popupIndex] as HTMLElement;
            if (popupTile) {
              this.showScorePopup(-penaltyVal, popupIndex, true);
              if (baseEl && roundScoreBox) {
                await this.transferParticles(popupTile, baseEl, true);
                const oldBase = currentRoundBase;
                currentRoundBase -= penaltyVal;
                if (isFirstScore) {
                  baseEl.textContent = currentRoundBase.toString();
                  isFirstScore = false;
                } else {
                  this.animateAdd(oldBase, currentRoundBase, baseEl, roundScoreBox);
                }
              }
            }
          }

          const laneCells = laneIndices.map((idx) => this.matrixElement?.children[idx] as HTMLElement);
          let sx = 0, sy = 0;
          if (laneShift.type === 'row') sx = laneShift.direction * stride;
          else sy = laneShift.direction * stride;

          const shiftPromises = laneCells.map((cell) => gsap.to(cell, {
            x: sx,
            y: sy,
            duration: clashTiming.shift,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.set(cell, { x: 0, y: 0 });
            }
          }));
          await Promise.all(shiftPromises);

          laneIndices.forEach((idx) => {
            const r = Math.floor(idx / size);
            const c = idx % size;
            (this.matrixElement?.children[idx] as HTMLImageElement).src = blockAsset(result.newGrid[r][c]);
          });
          continue;
        }

        const laneStartsWinning = result.replacedCells.some((cell) => cell.r === firstCellPos.r && cell.c === firstCellPos.c);

        if (laneStartsWinning && attackerBlock) {
          gsap.set(attackerBlock, { opacity: 0 });
        } else if (attackerBlock) {
          const firstCell = this.matrixElement?.children[firstCellIdx] as HTMLElement;
          if (firstCell) {
            const isTie = result.tieCells?.some(c => c.r === firstCellPos.r && c.c === firstCellPos.c);

            if (isTie) {
              gsap.to(attackerBlock, { x: "+=4", duration: clashTiming.shakeStep, yoyo: true, repeat: 5, onComplete: () => {
                gsap.to(attackerBlock, { scale: 0, opacity: 0, rotation: (Math.random() - 0.5) * 180, duration: clashTiming.vanish, ease: 'power2.in' });
              }});
              gsap.fromTo(firstCell, { x: -4 }, { x: 4, duration: clashTiming.shakeStep, yoyo: true, repeat: 5, onComplete: () => { gsap.set(firstCell, { x: 0 }); } });
            } else {
              gsap.to(attackerBlock, { scale: 0, opacity: 0, duration: clashTiming.vanish, ease: 'power2.in' });
              gsap.fromTo(firstCell, { x: -4 }, { x: 4, duration: clashTiming.shakeStep, yoyo: true, repeat: 5, onComplete: () => { gsap.set(firstCell, { x: 0 }); } });
              gsap.fromTo(firstCell, { filter: 'brightness(1.5) hue-rotate(-30deg)' }, { filter: 'none', duration: 0.28 });
            }
            await new Promise((resolve) => setTimeout(resolve, clashTiming.scorePause));
          } else {
            gsap.to(attackerBlock, { scale: 0, opacity: 0, duration: clashTiming.vanish, ease: 'power2.in' });
            await new Promise((resolve) => setTimeout(resolve, clashTiming.settlePause));
          }
        }

        let laneWinStreak = 0;
        for (let step = 0; step < size; step += 1) {
          const index = laneIndices[step];
          const cellPos = { r: Math.floor(index / size), c: index % size };
          
          const isReplaced = result.replacedCells.some((cell) => cell.r === cellPos.r && cell.c === cellPos.c);
          const isFailed = result.failedCells?.some((cell) => cell.r === cellPos.r && cell.c === cellPos.c);
          const isTie = result.tieCells?.some((cell) => cell.r === cellPos.r && cell.c === cellPos.c);

          if (!isReplaced && !isFailed && !isTie) break;

          const img = this.matrixElement?.children[index] as HTMLImageElement;
          
          if ((isFailed || isTie) && img) {
            gsap.fromTo(img, { x: -4 }, { x: 4, duration: clashTiming.shakeStep, yoyo: true, repeat: 5, onComplete: () => { gsap.set(img, { x: 0 }); } });
            
            if (isFailed) {
              const attackerType = selectedCard.symbols[cardIndex];
              const penaltyVal = Number(SCORE_WEIGHTS[attackerType]) || 0;
              
              if (penaltyVal > 0) {
                gsap.fromTo(img, { filter: 'brightness(1.5) hue-rotate(-30deg)' }, { filter: 'none', duration: 0.28 });
                
                const popupIndex = step > 0 ? laneIndices[step - 1] : index;
                const popupTile = this.matrixElement?.children[popupIndex] as HTMLElement;
                if (popupTile) {
                  this.showScorePopup(-penaltyVal, popupIndex, true);
                  if (baseEl && roundScoreBox) {
                    await this.transferParticles(popupTile, baseEl, true);
                    const oldBase = currentRoundBase;
                    currentRoundBase -= penaltyVal;
                    if (isFirstScore) {
                      baseEl.textContent = currentRoundBase.toString();
                      isFirstScore = false;
                    } else {
                      this.animateAdd(oldBase, currentRoundBase, baseEl, roundScoreBox);
                    }
                  }
                }
              }
            }
            await new Promise((resolve) => setTimeout(resolve, clashTiming.failPause));
            break;
          }

          if (isReplaced && img) {
            laneWinStreak += 1;
            const defenderSymbol = state.matrix.grid[cellPos.r][cellPos.c];
            const gain = SCORE_WEIGHTS[defenderSymbol];
            const smash = 30; let sx = 0, sy = 0;
            if (edge === 'TOP') sy = -smash; else if (edge === 'BOTTOM') sy = smash;
            else if (edge === 'LEFT') sx = -smash; else if (edge === 'RIGHT') sx = smash;

            img.src = blockAsset(result.newGrid[cellPos.r][cellPos.c]);
            gsap.fromTo(img,
              { x: sx, y: sy, scale: 1.5, zIndex: 100, filter: 'brightness(2) contrast(1.1) drop-shadow(0 0 15px rgba(255,160,0,0.8))' },
              { x: 0, y: 0, scale: 1, zIndex: 1, filter: 'brightness(1) contrast(1) drop-shadow(0 0 0px rgba(0,0,0,0))', duration: clashTiming.impact, ease: 'elastic.out(1, 0.6)' }
            );

            if (gain > 0) {
              this.showScorePopup(gain, index, false, laneWinStreak);
              if (baseEl && roundScoreBox) {
                await this.transferParticles(img, baseEl);
                const oldBase = currentRoundBase;
                currentRoundBase += gain;
                if (isFirstScore) {
                  baseEl.textContent = currentRoundBase.toString();
                  isFirstScore = false;
                } else {
                  this.animateAdd(oldBase, currentRoundBase, baseEl, roundScoreBox);
                }
              }
            }
            await new Promise((resolve) => setTimeout(resolve, clashTiming.scorePause));
          }
        }
        
        const replacedInLane = result.replacedCells.filter(c => {
          return laneIndices.some(idx => Math.floor(idx / size) === c.r && idx % size === c.c);
        }).length;
        
        if (replacedInLane >= size) {
          currentPierce += 1;
          if (multEl && roundScoreBox) {
            const popupIndex = laneIndices[Math.floor(laneIndices.length / 2)] ?? laneIndices[laneIndices.length - 1];
            const pierceScale = laneWinStreak + 1;
            await this.showPierceMultiplierPopup(popupIndex, multEl, pierceScale);
            const newMult = 2 ** currentPierce;
            if (currentPierce === 1) {
              multEl.textContent = `2`;
              gsap.fromTo(multEl, { scale: 0.85, y: 6 }, { scale: 1.18, y: 0, duration: 0.22, yoyo: true, repeat: 1, ease: 'steps(4)' });
            } else {
              const oldMult = 2 ** (currentPierce - 1);
              this.animateAdd(oldMult, newMult, multEl, roundScoreBox);
            }
            await new Promise((resolve) => setTimeout(resolve, clashTiming.lanePause));
          }
        }

        await new Promise((resolve) => setTimeout(resolve, clashTiming.lanePause));
      }

      if (roundScoreBox && baseEl && (currentRoundBase !== 0 || currentPierce > 0)) {
        gsap.fromTo(roundScoreBox, { filter: 'brightness(1)' }, { filter: 'brightness(1.18)', duration: 0.08, yoyo: true, repeat: 3 });
        await new Promise((resolve) => setTimeout(resolve, 180));
      }

      await new Promise((resolve) => setTimeout(resolve, clashTiming.settlePause));
    } finally {
      this.store.applyClashResult(result);
      this.isAnimating = false;
      this.render();
    }
  }



  private showScorePopup(score: number, matrixIndex: number, isPenalty: boolean = false): void {
    const tile = this.matrixElement?.children[matrixIndex] as HTMLElement;
    const wrapper = this.matrixWrapperElement;
    if (!tile || !wrapper) return;

    const popup = document.createElement('div');
    popup.className = 'float';
    popup.textContent = score > 0 ? `+${score}` : `${score}`;
    if (isPenalty) {
      popup.style.color = '#F44336';
      popup.style.textShadow = '0 4px 12px rgba(244, 67, 54, 0.9), 0 0 6px rgba(244, 67, 54, 0.6)';
    }
    wrapper.appendChild(popup);
    
    // Calculate position relative to the wrapper
    const tileRect = tile.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const startX = tileRect.left - wrapperRect.left + tileRect.width / 2;
    const startY = tileRect.top - wrapperRect.top + tileRect.height / 2;
    
    gsap.fromTo(popup, { left: startX, top: startY, xPercent: -50, yPercent: -50, opacity: 1, scale: 0.5 }, {
      left: startX + (Math.random() * 2 - 1) * 30,
      top: startY - 60,
      opacity: 0,
      scale: 1.5,
      duration: 0.8,
      ease: "power3.out",
      onComplete: () => popup.remove()
    });
  }

  private async transferParticles(fromEl: HTMLElement, toEl: HTMLElement, isPenalty: boolean = false): Promise<void> {
    const stage = document.body;
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
    const to = { x: b.left + b.width / 2, y: b.top + b.height / 2 };

    const count = 22;
    const color = isPenalty ? '#F44336' : '#fff';
    
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "p";
      p.style.width = "6px";
      p.style.height = "6px";
      p.style.backgroundColor = color;
      p.style.boxShadow = `0 0 6px ${color}`;
      stage.appendChild(p);
      gsap.fromTo(p, { left: from.x, top: from.y, opacity: 1, scale: 1 }, {
        left: to.x + (Math.random() * 2 - 1) * 26,
        top: to.y + (Math.random() * 2 - 1) * 26,
        opacity: 0,
        scale: 0,
        duration: 0.7,
        delay: Math.random() * 0.1,
        ease: "power3.inOut",
        onComplete: () => p.remove()
      });
    }
    
    // Wait for the average duration
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  private animateAdd(from: number, to: number, el: HTMLElement, wrap: HTMLElement): void {
    const state = { value: from };
    
    // 1) 数字滚动
    gsap.to(state, {
      value: to,
      duration: 0.55,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => { el.textContent = Math.round(state.value).toLocaleString(); }
    });

    // 2) 轻微闪烁
    gsap.fromTo(wrap, { filter: "brightness(1)" }, { filter: "brightness(1.35)", duration: 0.08, yoyo: true, repeat: 1 });
    gsap.fromTo(el, { color: "#2d3432" }, { color: "#1049f1", duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.08, delay: 0 });

    // 3) 数字本体抖动
    gsap.fromTo(el, { x: 0, y: 0 }, {
      x: () => gsap.utils.random(-10, 10),
      y: () => gsap.utils.random(-4, 4),
      duration: 0.25,
      ease: "power2.out",
      yoyo: true,
      repeat: 5,
      repeatRefresh: true
    });

    // 4) 数字放大再回落
    const popBoost = Math.max(0, 1.14 - 1);
    const currentScale = Number(gsap.getProperty(el, "scale")) || 1;
    const targetScale = Math.min(Math.max(1.14, currentScale + popBoost), 1 + popBoost * 3);
    gsap.killTweensOf(el, "scale");
    gsap.timeline()
      .to(el, { scale: targetScale, duration: 0.18, ease: "power2.out" })
      .to(el, { scale: 1, duration: 0.18 * 1.15, ease: "power3.out" });
  }

  private updateHeldPosition(): void {
    if (this.isAnimating) return;
    const state = this.store.getState();
    const lastId = state.selectedCardIds[state.selectedCardIds.length - 1];
    this.handElement?.querySelectorAll('.held').forEach((el) => {
      const cardId = el.getAttribute('data-card-id');
      if (cardId !== lastId) {
        el.classList.remove('held');
        (el as HTMLElement).style.left = '';
        (el as HTMLElement).style.top = '';
        gsap.set(el, { clearProps: "all" });
      }
    });

    if (!lastId) return;

    const cardElement = this.handElement?.querySelector(`[data-card-id="${lastId}"]`) as HTMLElement | null;
    if (!cardElement || !this.handElement) return;

    const shouldReturnToHand = this.isInsideSafeZone();

      if (shouldReturnToHand) {
        if (state.preview) {
          this.store.updatePreview(null);
        }
        if (cardElement.classList.contains('held') || state.preview) {
          cardElement.classList.remove('held');
          cardElement.style.left = '';
          cardElement.style.top = '';
          gsap.killTweensOf(cardElement);
          gsap.set(cardElement, { 
            clearProps: 'xPercent,yPercent,rotationX,rotationY,transformPerspective,opacity,pointerEvents' 
          });
          // Reset follower state
          this.isHovering = false;
          this.currentCardX = 0;
          this.currentCardY = 0;
          this.render();
        }
        return;
      }

    if (!cardElement.classList.contains('held')) {
      cardElement.classList.add('held');
      gsap.killTweensOf(cardElement);
      
      // Initialize the follower coordinates to current mouse pos when we pick it up
      const r = this.matrixWrapperElement?.getBoundingClientRect();
      if (r) {
        this.currentCardX = this.mouseX - r.left - r.width / 2;
        this.currentCardY = this.mouseY - r.top - r.height / 2;
      }
      
      if (state.selectedCardIds.length > 1) {
        this.store.focusCard(lastId);
        this.renderHand(this.store.getState());
      }
    }
    // Removed direct static GSAP set here, because updateFollower() handles it via ticker now.
  }

  private showPileModal(type: 'DECK' | 'DISCARD'): void {
    const state = this.store.getState();
    const cards = type === 'DECK' ? state.deck : state.discardPile;
    const title = type === 'DECK' ? I18N[currentLang].DECK : I18N[currentLang].WASTED;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay pile-overlay';
    overlay.innerHTML = `
      <div class="modal-content pile-view">
        <div class="modal-header"><h2>${title} (${cards.length})</h2><button class="close-btn">&times;</button></div>
        <div class="pile-grid">
          ${cards.map((card) => `<div class="pile-card-item">${createCardMarkup(card)}</div>`).join('')}
        </div>
      </div>
    `;
    this.root.appendChild(overlay);
    overlay.querySelector('.close-btn')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  private renderSpecialCards(state: GameState): void {
    const container = document.getElementById('ui-special-cards');
    if (!container) return;

    const sleeveDefinitions = this.store.getSleeveDefinitions();
    const sleeves = state.sleeves
      .map((card) => {
        const definition = sleeveDefinitions.find((candidate) => candidate.id === card.definitionId);
        return definition ? { ...card, definition } : null;
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);
    const giftCards = state.giftCards
      .map((card) => {
        const definition = this.store.getGiftCardDefinitionById(card.definitionId);
        return definition ? { ...card, definition } : null;
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);
    const playmats = state.playmats
      .map((card) => {
        const definition = this.store.getPlaymatDefinitionById(card.definitionId);
        return definition ? { ...card, definition } : null;
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

    container.innerHTML = `
      <div class="reward-slot reward-slot-sleeves">
        <div class="inventory-label">${I18N[currentLang].SLEEVE}</div>
        <div class="special-cards-list">
          ${sleeves.map((card) => createSpecialCardMarkup(
            localizeText(card.definition.name, card.definition.nameI18n),
            localizeText(card.definition.shortName, card.definition.shortNameI18n),
            localizeText(card.definition.description, card.definition.descriptionI18n),
            card.definition.accent,
            'special-card-mini'
          )).join('') || `<div class="special-card-empty mini">${I18N[currentLang].NONE}</div>`}
        </div>
      </div>
      <div class="reward-slot reward-slot-gifts">
        <div class="inventory-label">${I18N[currentLang].GIFT_CARD}</div>
        <div class="special-cards-list gift-cards-list">
          ${giftCards.map((card) => `
            <div class="gift-card-item">
              ${createSpecialCardMarkup(
                localizeText(card.definition.name, card.definition.nameI18n),
                localizeText(card.definition.shortName, card.definition.shortNameI18n),
                localizeText(card.definition.description, card.definition.descriptionI18n),
                card.definition.accent,
                'special-card-mini'
              )}
              <button class="giftcard-use-btn" data-giftcard-id="${card.instanceId}" ${state.status !== 'SHOP' ? 'disabled' : ''}>${I18N[currentLang].USE}</button>
            </div>
          `).join('') || `<div class="special-card-empty mini">${I18N[currentLang].NONE}</div>`}
        </div>
      </div>
      <div class="reward-slot reward-slot-playmats">
        <div class="inventory-label">${I18N[currentLang].PLAYMAT}${state.activePlaymatDefinitionId ? ' · ACTIVE' : ''}</div>
        <div class="special-cards-list gift-cards-list">
          ${playmats.map((card) => `
            <div class="gift-card-item">
              ${createSpecialCardMarkup(
                localizeText(card.definition.name, card.definition.nameI18n),
                localizeText(card.definition.shortName, card.definition.shortNameI18n),
                localizeText(card.definition.description, card.definition.descriptionI18n),
                card.definition.accent,
                'special-card-mini'
              )}
              <button class="playmat-use-btn" data-playmat-id="${card.instanceId}" ${state.status !== 'PLAYING' || Boolean(state.activePlaymatDefinitionId) ? 'disabled' : ''}>${I18N[currentLang].USE}</button>
            </div>
          `).join('') || `<div class="special-card-empty mini">${I18N[currentLang].NONE}</div>`}
        </div>
      </div>
    `;

    container.querySelectorAll('.giftcard-use-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const giftCardId = button.getAttribute('data-giftcard-id');
        if (!giftCardId) return;
        if (this.store.useGiftCard(giftCardId)) {
          this.render();
        }
      });
    });
    container.querySelectorAll('.playmat-use-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const playmatId = button.getAttribute('data-playmat-id');
        if (!playmatId) return;
        if (this.store.usePlaymat(playmatId)) {
          this.render();
        }
      });
    });
  }

  private renderStatusOverlay(state: GameState): void {
    this.root.querySelector('.status-overlay')?.remove();

    if (state.status === 'PLAYING') return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay status-overlay';

    if (state.status === 'HOME') {
      const decks = this.store.getDeckDefinitions();
      if (decks.length === 0) return;
      this.deckSelectIndex = ((this.deckSelectIndex % decks.length) + decks.length) % decks.length;
      const deck = decks[this.deckSelectIndex];
      const symbolCounts = deck.cards.reduce((counts, entry) => {
        entry.code.toUpperCase().split('').forEach((digit) => {
          if (digit === '4') counts.rock += entry.count;
          else if (digit === '3') counts.scissors += entry.count;
          else if (digit === '1') counts.paper += entry.count;
          else if (digit === '7' || digit === 'O') counts.tricolor += entry.count;
        });
        return counts;
      }, { rock: 0, scissors: 0, paper: 0, tricolor: 0 });

      overlay.innerHTML = `
        <div class="home-screen">
          <div class="home-stage">
            <div class="home-logo">ROSHAMBO</div>
            <div class="home-deck-carousel">
              <button class="home-arrow home-arrow-left" id="home-deck-prev" aria-label="Previous deck">‹</button>
              <div class="home-deck-card" data-deck-id="${deck.id}">
                <div class="home-deck-cover" aria-hidden="true"></div>
                <h2>${deck.name}</h2>
                <div class="home-deck-divider"></div>
                <p>${deck.unlockDocument?.description || 'A balanced starting deck for steady scoring.'}</p>
                <div class="home-deck-stats">
                  <span><img src="${blockAsset(RPS.ROCK)}" alt="">${symbolCounts.rock}</span>
                  <span><img src="${blockAsset(RPS.PAPER)}" alt="">${symbolCounts.paper}</span>
                  <span><img src="${blockAsset(RPS.SCISSORS)}" alt="">${symbolCounts.scissors}</span>
                  <span class="home-tricolor-stat">◆ ${symbolCounts.tricolor || Math.round(deck.startingConfig.interestRate * 100)}%</span>
                </div>
              </div>
              <button class="home-arrow home-arrow-right" id="home-deck-next" aria-label="Next deck">›</button>
            </div>
            <div class="home-deck-dots">
              ${decks.map((_, index) => `<span class="${index === this.deckSelectIndex ? 'active' : ''}"></span>`).join('')}
            </div>
            <div class="home-actions">
              <button class="home-action secondary">Settings</button>
              <button class="home-action secondary">Collection</button>
              <button id="home-start-btn" class="home-action primary">Start Game</button>
              <button class="home-action secondary">Records</button>
              <button class="home-action danger">Quit</button>
            </div>
          </div>
        </div>
      `;
      this.root.appendChild(overlay);
      overlay.querySelector('#home-deck-prev')?.addEventListener('click', () => {
        this.deckSelectIndex = (this.deckSelectIndex - 1 + decks.length) % decks.length;
        this.render();
      });
      overlay.querySelector('#home-deck-next')?.addEventListener('click', () => {
        this.deckSelectIndex = (this.deckSelectIndex + 1) % decks.length;
        this.render();
      });
      overlay.querySelector('#home-start-btn')?.addEventListener('click', () => {
        this.store.openDeckSelect();
        this.store.chooseDeckById(deck.id);
        this.render();
      });
      return;
    }

    if (state.status === 'CHOOSE_DECK') {
      const decks = this.store.getDeckDefinitions();
      if (decks.length === 0) return;
      this.deckSelectIndex = ((this.deckSelectIndex % decks.length) + decks.length) % decks.length;
      const deck = decks[this.deckSelectIndex];
      const cards = this.store.getDeckPreviewCards(deck.id);

      overlay.innerHTML = `
        <div class="modal-content deck-selector">
          <h1>${I18N[currentLang].CHOOSE_DECK}</h1>
          <div class="deck-carousel">
            <button class="deck-nav-btn" id="deck-prev-btn">◀</button>
            <div class="deck-option single" data-deck-id="${deck.id}">
              <h3>${deck.name}</h3>
              <div class="preview-cards">
                ${cards.map((card) => createCardMarkup(card)).join('')}
              </div>
              <div class="deck-page">${this.deckSelectIndex + 1} / ${decks.length}</div>
              <button id="deck-confirm-btn" class="status-button success">${I18N[currentLang].CONTINUE}</button>
            </div>
            <button class="deck-nav-btn" id="deck-next-btn">▶</button>
          </div>
        </div>
      `;
      this.root.appendChild(overlay);
      overlay.querySelector('#deck-prev-btn')?.addEventListener('click', () => {
        this.deckSelectIndex = (this.deckSelectIndex - 1 + decks.length) % decks.length;
        this.render();
      });
      overlay.querySelector('#deck-next-btn')?.addEventListener('click', () => {
        this.deckSelectIndex = (this.deckSelectIndex + 1) % decks.length;
        this.render();
      });
      overlay.querySelector('#deck-confirm-btn')?.addEventListener('click', () => {
        this.store.chooseDeckById(deck.id);
        this.render();
      });
      return;
    }

    if (state.status === 'CHOOSE_SLEEVE') {
      const sleeveIds = state.sleeveChoices;
      const sleeves = sleeveIds.map(id => this.store.getSleeveDefinitions().find(s => s.id === id)).filter(Boolean);

      overlay.innerHTML = `
        <div class="modal-content shop-card">
          <h1 class="status-title gold">${I18N[currentLang].CHOOSE_SLEEVE}</h1>
          <div class="pack-picker">
            <div class="shop-grid">
              ${sleeves.map((sleeve) => `
                <div class="shop-offer" data-sleeve-id="${sleeve!.id}">
                  <div class="shop-offer-kind">${I18N[currentLang].SLEEVES}</div>
                  ${createSpecialCardMarkup(
                    localizeText(sleeve!.name, sleeve!.nameI18n),
                    localizeText(sleeve!.shortName, sleeve!.shortNameI18n),
                    localizeText(sleeve!.description, sleeve!.descriptionI18n),
                    sleeve!.accent
                  )}
                  <button class="status-button success select-sleeve-btn">${I18N[currentLang].USE}</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      this.root.appendChild(overlay);

      const btns = overlay.querySelectorAll('.select-sleeve-btn');
      btns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const choiceEl = (e.target as HTMLElement).closest('.shop-offer');
          const sleeveId = choiceEl?.getAttribute('data-sleeve-id');
          if (sleeveId) {
            this.store.chooseSleeveById(sleeveId);
            this.render();
          }
        });
      });
      return;
    }

    if (state.status === 'ROUND_REWARD' && state.pendingReward) {
      overlay.innerHTML = `
        <div class="modal-content status-card reward-card">
          <h1 class="status-title success">${I18N[currentLang].ROUND_REWARD}</h1>
          <p class="status-copy">${state.pendingReward.levelName} · ${I18N[currentLang].STAGE} ${state.pendingReward.stage}/${state.totalStages}</p>
          <div class="reward-breakdown">
            <div class="reward-row"><span>${I18N[currentLang].LEVEL_REWARD}</span><strong>+${state.pendingReward.baseReward}</strong></div>
            <div class="reward-row"><span>${I18N[currentLang].INTEREST_REWARD}</span><strong>+${state.pendingReward.interestReward}</strong></div>
            <div class="reward-row total"><span>${I18N[currentLang].TOTAL_REWARD}</span><strong>+${state.pendingReward.totalReward}</strong></div>
          </div>
          <button id="shop-btn" class="status-button success">${I18N[currentLang].ENTER_SHOP}</button>
        </div>
      `;
      this.root.appendChild(overlay);
      overlay.querySelector('#shop-btn')?.addEventListener('click', () => {
        this.store.openShop();
        this.render();
      });
      return;
    }

    if (state.status === 'SHOP') {
      const offers = state.shopOffers.map((offer) => {
        if (offer.kind === 'sleeve') {
          const definition = this.store.getSleeveDefinitions().find((candidate) => candidate.id === offer.definitionId);
          return definition ? {
            offer,
            label: offer.form === 'pack' ? 'Sleeve Pack' : 'Sleeve',
            description: localizeText(definition.description, definition.descriptionI18n),
            accent: definition.accent,
            name: localizeText(definition.name, definition.nameI18n),
            shortName: localizeText(definition.shortName, definition.shortNameI18n)
          } : null;
        }
        if (offer.kind === 'giftcard') {
          const definition = this.store.getGiftCardDefinitionById(offer.definitionId ?? '');
          return definition ? {
            offer,
            label: offer.form === 'pack' ? 'Gift Pack' : 'Gift Card',
            description: localizeText(definition.description, definition.descriptionI18n),
            accent: definition.accent,
            name: localizeText(definition.name, definition.nameI18n),
            shortName: localizeText(definition.shortName, definition.shortNameI18n)
          } : null;
        }
        if (offer.kind === 'playmat') {
          const definition = this.store.getPlaymatDefinitionById(offer.definitionId ?? '');
          return definition ? {
            offer,
            label: offer.form === 'pack' ? 'Playmat Pack' : 'Playmat',
            description: localizeText(definition.description, definition.descriptionI18n),
            accent: definition.accent,
            name: localizeText(definition.name, definition.nameI18n),
            shortName: localizeText(definition.shortName, definition.shortNameI18n)
          } : null;
        }
        const card = offer.cardCode ? { id: `shop-${offer.offerId}`, symbols: offer.cardCode.toUpperCase().split('').map((digit) => ({ '0': RPS.BLANK, '1': RPS.PAPER, '3': RPS.SCISSORS, '4': RPS.ROCK, O: RPS.TRICOLOR, '7': RPS.TRICOLOR }[digit] ?? RPS.BLANK)) } : null;
        return card ? { offer, label: offer.form === 'pack' ? 'Card Pack' : 'Card', card, description: offer.form === 'pack' ? `${offer.choices?.length ?? 0} choices, pick 1` : `Adds ${offer.cardCode} to your run deck`, accent: '#90e0ef', name: offer.cardCode ?? 'Card', shortName: 'Card' } : null;
      }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
      const openedPack = state.openedPackOfferId ? state.shopOffers.find((offer) => offer.offerId === state.openedPackOfferId) ?? null : null;
      overlay.innerHTML = `
        <div class="modal-content status-card shop-card">
          <h1 class="status-title gold">${I18N[currentLang].SHOP}</h1>
          <p class="status-copy">${I18N[currentLang].CHIPS}: ${state.chips}</p>
          <div class="shop-grid">
            ${offers.map(({ offer, label, description, accent, name, shortName, card }) => `
              <div class="shop-offer ${offer.purchased ? 'purchased' : ''}">
                <div class="shop-offer-kind">${label}</div>
                ${card ? `<div class="shop-card-preview">${createCardMarkup(card)}</div>` : createSpecialCardMarkup(name, shortName, description, accent)}
                ${card ? `<div class="shop-card-caption">${description}</div>` : ''}
                <button
                  class="status-button primary shop-buy-btn"
                  data-offer-id="${offer.offerId}"
                  ${offer.purchased || state.chips < offer.cost ? 'disabled' : ''}
                >
                  ${offer.purchased ? I18N[currentLang].PURCHASED : `${I18N[currentLang].BUY} (${offer.cost})`}
                </button>
                ${offer.kind === 'giftcard' && offer.purchased && offer.definitionId ? `<button class="status-button shop-use-gift-btn" data-gift-definition-id="${offer.definitionId}">${I18N[currentLang].USE}</button>` : ''}
              </div>
            `).join('')}
          </div>
          ${openedPack ? `
              <div class="pack-picker">
              <div class="pack-picker-title">${I18N[currentLang].CHOOSE_ONE}</div>
              <div class="shop-grid">
                ${(openedPack.choices ?? []).map((choice, index) => {
                  if (choice.kind === 'card' && choice.cardCode) {
                    const packCard: Card = { id: `pack-${index}`, symbols: choice.cardCode.toUpperCase().split('').map((digit) => ({ '0': RPS.BLANK, '1': RPS.PAPER, '3': RPS.SCISSORS, '4': RPS.ROCK, O: RPS.TRICOLOR, '7': RPS.TRICOLOR }[digit] ?? RPS.BLANK)) };
                    return `
                      <div class="shop-offer">
                        <div class="shop-offer-kind">Card</div>
                        <div class="shop-card-preview">${createCardMarkup(packCard)}</div>
                        <button class="status-button primary pack-choice-btn" data-offer-id="${openedPack.offerId}" data-choice-index="${index}">Pick</button>
                      </div>
                    `;
                  }
                  if (choice.kind === 'sleeve' && choice.definitionId) {
                    const definition = this.store.getSleeveDefinitions().find((candidate) => candidate.id === choice.definitionId);
                    if (!definition) return '';
                    return `
                      <div class="shop-offer">
                        <div class="shop-offer-kind">Sleeve</div>
                        ${createSpecialCardMarkup(definition.name, definition.shortName, definition.description, definition.accent)}
                        <button class="status-button primary pack-choice-btn" data-offer-id="${openedPack.offerId}" data-choice-index="${index}">Pick</button>
                      </div>
                    `;
                  }
                  if (choice.kind === 'giftcard' && choice.definitionId) {
                    const definition = this.store.getGiftCardDefinitionById(choice.definitionId);
                    if (!definition) return '';
                    return `
                      <div class="shop-offer">
                        <div class="shop-offer-kind">Gift Card</div>
                        ${createSpecialCardMarkup(localizeText(definition.name, definition.nameI18n), localizeText(definition.shortName, definition.shortNameI18n), localizeText(definition.description, definition.descriptionI18n), definition.accent)}
                        <button class="status-button primary pack-choice-btn" data-offer-id="${openedPack.offerId}" data-choice-index="${index}">Pick</button>
                      </div>
                    `;
                  }
                  if (choice.kind === 'playmat' && choice.definitionId) {
                    const definition = this.store.getPlaymatDefinitionById(choice.definitionId);
                    if (!definition) return '';
                    return `
                      <div class="shop-offer">
                        <div class="shop-offer-kind">Playmat</div>
                        ${createSpecialCardMarkup(localizeText(definition.name, definition.nameI18n), localizeText(definition.shortName, definition.shortNameI18n), localizeText(definition.description, definition.descriptionI18n), definition.accent)}
                        <button class="status-button primary pack-choice-btn" data-offer-id="${openedPack.offerId}" data-choice-index="${index}">Pick</button>
                      </div>
                    `;
                  }
                  return '';
                }).join('')}
              </div>
              <button id="skip-pack-btn" class="status-button">${I18N[currentLang].SKIP}</button>
            </div>
          ` : ''}
          <button id="continue-btn" class="status-button success">${I18N[currentLang].CONTINUE}</button>
        </div>
      `;
      this.root.appendChild(overlay);
      overlay.querySelectorAll('.shop-buy-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const offerId = button.getAttribute('data-offer-id');
          if (!offerId) return;
          this.store.buyShopOffer(offerId);
          this.render();
        });
      });
      overlay.querySelectorAll('.shop-use-gift-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const definitionId = button.getAttribute('data-gift-definition-id');
          if (!definitionId) return;
          const giftCard = state.giftCards.find((card) => card.definitionId === definitionId);
          if (!giftCard) return;
          this.store.useGiftCard(giftCard.instanceId);
          this.render();
        });
      });
      overlay.querySelectorAll('.pack-choice-btn').forEach((button) => {
        button.addEventListener('click', () => {
          const offerId = button.getAttribute('data-offer-id');
          const choiceIndex = Number(button.getAttribute('data-choice-index'));
          if (!offerId || !Number.isFinite(choiceIndex)) return;
          this.store.choosePackChoice(offerId, choiceIndex);
          this.render();
        });
      });
      overlay.querySelector('#skip-pack-btn')?.addEventListener('click', () => {
        this.store.skipOpenedPack();
        this.render();
      });
      overlay.querySelector('#continue-btn')?.addEventListener('click', () => {
        this.store.continueAfterShop();
        this.render();
      });
      return;
    }

    if (state.status === 'WIN') {
      overlay.innerHTML = `
        <div class="modal-content status-card">
          <h1 class="status-title gold">${I18N[currentLang].WIN}</h1>
          <p class="status-copy">${I18N[currentLang].FINAL_RUN_CLEAR}</p>
          <p class="status-copy">${I18N[currentLang].FINAL_CHIPS}: ${state.chips}</p>
          <button id="restart-btn" class="status-button primary">${I18N[currentLang].RESTART}</button>
        </div>
      `;
      this.root.appendChild(overlay);
      overlay.querySelector('#restart-btn')?.addEventListener('click', () => {
        this.store.resetGame();
        this.render();
      });
      return;
    }

    overlay.innerHTML = `
      <div class="modal-content status-card">
        <h1 class="status-title">${I18N[currentLang].GAME_OVER}</h1>
        <p class="status-copy">Final Score: ${state.currentScore}</p>
        <button id="restart-btn" class="status-button danger">${I18N[currentLang].RESTART}</button>
      </div>
    `;
    this.root.appendChild(overlay);
    overlay.querySelector('#restart-btn')?.addEventListener('click', () => {
      this.store.resetGame();
      this.render();
    });
  }

  private render(): void {
    const state = this.store.getState();
    const size = state.matrix.size;
    const lastPreviewEdge = this.store.getLastPreviewEdge();
    const htmlLang: Record<Lang, string> = { EN: 'en', ZH: 'zh-Hans', ZH_TW: 'zh-Hant', JA: 'ja' };
    document.documentElement.lang = htmlLang[currentLang];

    document.documentElement.style.setProperty('--matrix-size', String(size));
    document.documentElement.style.setProperty('--card-length', String(CARD_LENGTH));

    const levelEl = document.getElementById('ui-level'); if (levelEl) levelEl.textContent = `${I18N[currentLang].STAGE} ${state.currentStage}/${state.totalStages}`;
    const levelNameEl = document.getElementById('ui-level-name'); if (levelNameEl) levelNameEl.textContent = state.levelName;
    const levelIconEl = document.getElementById('ui-level-icon') as HTMLImageElement | null; if (levelIconEl) levelIconEl.src = iconAsset(state.levelIcon);
    const formatNumber = (value: number) => Math.max(0, Math.floor(value || 0)).toLocaleString('en-US');
    const activeScoreSource = state.preview ?? state.lastClash;
    const baseScore = activeScoreSource?.baseScoreDelta ?? activeScoreSource?.scoreDelta ?? 0;
    const multiplier = activeScoreSource?.pierceMultiplier ?? 1;
    const goalEl = document.getElementById('ui-goal'); if (goalEl) goalEl.textContent = formatNumber(state.levelGoal || 0);
    const goalInlineEl = document.getElementById('ui-goal-inline'); if (goalInlineEl) goalInlineEl.textContent = formatNumber(state.levelGoal || 0);
    const scoreEl = document.getElementById('ui-score'); if (scoreEl) scoreEl.textContent = formatNumber(state.currentScore || 0);
    const baseScoreEl = document.getElementById('ui-base-score'); if (baseScoreEl) baseScoreEl.textContent = formatNumber(baseScore);
    const scoreMultiplierEl = document.getElementById('ui-score-multiplier'); if (scoreMultiplierEl) scoreMultiplierEl.textContent = `${multiplier}`;
    const chipsEl = document.getElementById('ui-chips'); if (chipsEl) chipsEl.textContent = formatNumber(state.chips || 0);
    const interestPreviewEl = document.getElementById('ui-interest-preview'); if (interestPreviewEl) interestPreviewEl.textContent = `+${this.store.getProjectedInterest()}`;

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

    // Update Translations
    const stageLabel = document.getElementById('ui-level');
    if (stageLabel) stageLabel.textContent = `${I18N[currentLang].STAGE} ${state.currentStage}/${state.totalStages}`;
    
    const stageName = document.getElementById('ui-level-name');
    if (stageName) {
      const key = state.levelName.toUpperCase() as keyof typeof I18N['EN'];
      stageName.textContent = I18N[currentLang][key] || state.levelName;
    }
    const stageEffect = document.getElementById('ui-stage-effect');
    if (stageEffect) {
      if (state.levelIcon === 'master') {
        stageEffect.textContent = I18N[currentLang].MASTER_EFFECT;
        stageEffect.classList.add('visible');
      } else {
        stageEffect.textContent = '';
        stageEffect.classList.remove('visible');
      }
    }
    
    const scoreLabel = document.getElementById('ui-score-label');
    if (scoreLabel) scoreLabel.textContent = I18N[currentLang].TOTAL_SCORE;

    const targetScoreLabel = document.getElementById('ui-target-score-label');
    if (targetScoreLabel) targetScoreLabel.textContent = I18N[currentLang].TARGET_SCORE;

    const baseScoreLabel = document.getElementById('ui-base-score-label');
    if (baseScoreLabel) baseScoreLabel.textContent = I18N[currentLang].BASE_SCORE;

    const multiplierLabel = document.getElementById('ui-multiplier-label');
    if (multiplierLabel) multiplierLabel.textContent = I18N[currentLang].MULTIPLIER;

    const chipsLabel = document.getElementById('ui-chips-label');
    if (chipsLabel) chipsLabel.textContent = I18N[currentLang].GOLD;

    const shuffleLabel = document.getElementById('ui-shuffle-label');
    if (shuffleLabel) shuffleLabel.textContent = I18N[currentLang].SHUFFLE_MATRIX;

    const dealLabel = document.getElementById('ui-deal-label');
    if (dealLabel) dealLabel.textContent = I18N[currentLang].DEAL_CARD;

    const endBtn = document.getElementById('ui-btn-end');
    if (endBtn) endBtn.textContent = I18N[currentLang].END;

    const rotateBtn = document.getElementById('ui-btn-rotate');
    if (rotateBtn) rotateBtn.textContent = I18N[currentLang].ROTATE;

    const deckLabel = document.querySelector('#ui-deck-pile .pile-label');
    if (deckLabel) deckLabel.textContent = I18N[currentLang].DECK;

    const discardLabel = document.querySelector('#ui-discard-pile .pile-label');
    if (discardLabel) discardLabel.textContent = I18N[currentLang].WASTED;

    this.renderSpecialCards(state);
    
    const clashScoreEl = document.getElementById('ui-clash-score');
    if (clashScoreEl) {
      if (state.preview && !this.isAnimating) {
        clashScoreEl.innerHTML = `GAIN <span style="color: var(--orange-accent)">+${state.preview.scoreDelta}</span> / LOSS <span style="color: var(--red-accent)">-${state.preview.penalty}</span>`;
      } else if (state.preview && this.isAnimating) {
        clashScoreEl.innerHTML = `GAIN <span style="color: var(--orange-accent)">+${state.preview.scoreDelta}</span>`;
      } else {
        clashScoreEl.textContent = 'LANE CLASH';
      }
    }

    if (this.matrixWrapperElement) {
      this.matrixWrapperElement.className = `matrix-wrapper ${state.selectedCardIds.length > 0 && !this.isAnimating ? 'state-pick' : ''} ${state.preview && !this.isAnimating ? 'state-preview' : ''} ${this.isAnimating ? 'state-animating' : ''}`;
      if (this.previewBoxElement) this.previewBoxElement.className = `preview-box preview-${lastPreviewEdge?.toLowerCase() || ''}`;
    }

    if (this.matrixElement) {
      this.matrixElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      this.matrixElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
      const gridToRender = state.matrix.grid;
      
      const expectedChildCount = size * size;
      while (this.matrixElement.children.length > expectedChildCount) {
        this.matrixElement.lastElementChild?.remove();
      }
      while (this.matrixElement.children.length < expectedChildCount) {
        this.matrixElement.appendChild(document.createElement('img'));
      }

      for (let r = 0; r < size; r += 1) {
        for (let c = 0; c < size; c += 1) {
          const img = this.matrixElement.children[r * size + c] as HTMLImageElement;
          const expectedSrc = blockAsset(gridToRender[r][c]);
          if (!img.src.includes(expectedSrc)) {
            img.src = expectedSrc;
          }
          if (state.preview && state.preview.replacedCells.some((cell) => cell.r === r && cell.c === c)) {
            img.style.filter = 'drop-shadow(0 0 5px rgba(255, 152, 0, 0.4))';
          } else {
            img.style.filter = '';
          }
        }
      }
    }

    EDGE_ORDER.forEach(edge => {
      const dz = this.matrixWrapperElement?.querySelector(`.drop-zone-${edge.toLowerCase()}`) as HTMLElement;
      if (!dz) return;
    });

      // Ensure preview card is completely clean and rebuilt when NOT animating
      if (this.previewBoxElement) {
        if (!state.preview || this.isAnimating) {
          // If we shouldn't show preview OR we are in animation, clean up completely
          this.previewBoxElement.innerHTML = '';
          this.previewBoxElement.style.display = 'none';
        } else if (state.preview && lastPreviewEdge) {
          const { cellSize, gap, stride } = this.getCellMetrics(size);
          const matrixExtent = this.matrixElement?.offsetWidth ?? 0;
          this.previewBoxElement.style.display = 'block';
          this.previewBoxElement.style.inset = '0';

          const selectedCard = state.hand.find((card) => card.id === state.selectedCardIds[state.selectedCardIds.length - 1]);
          if (selectedCard) {
            const overlapCount = selectedCard.symbols.length;
            
            let guide = this.previewBoxElement.querySelector('.preview-guide') as HTMLElement;
            if (!guide) {
              guide = document.createElement('div');
              guide.className = 'preview-guide';
              guide.style.position = 'absolute';
              this.previewBoxElement.appendChild(guide);
            }

            const orientation = lastPreviewEdge === 'TOP' || lastPreviewEdge === 'BOTTOM' ? 'horizontal' : 'vertical';
            let cardContainer = this.previewBoxElement.querySelector('.preview-card') as HTMLElement;
            if (!cardContainer) {
              cardContainer = createCardElement(selectedCard, 'preview-card', orientation);
              cardContainer.style.position = 'absolute';
              this.previewBoxElement.appendChild(cardContainer);
            } else {
              // Check if symbols length changed or if it was rendered as full image when it shouldn't be
              const currentBlocks = cardContainer.querySelectorAll('.card-block');
              if (currentBlocks.length !== overlapCount || cardContainer.classList.contains('full-asset')) {
                cardContainer.remove();
                cardContainer = createCardElement(selectedCard, 'preview-card', orientation);
                cardContainer.style.position = 'absolute';
                this.previewBoxElement.appendChild(cardContainer);
              } else {
                // Update orientation class
                if (orientation === 'horizontal') {
                  cardContainer.classList.add('render-card-horizontal');
                } else {
                  cardContainer.classList.remove('render-card-horizontal');
                }
                // Update blocks
                const blocks = Array.from(currentBlocks) as HTMLImageElement[];
                selectedCard.symbols.forEach((symbol, i) => {
                  const expectedSrc = blockAsset(symbol);
                  if (blocks[i] && !blocks[i].src.includes(expectedSrc)) {
                    blocks[i].src = expectedSrc;
                  }
                });
              }
            }

            if (lastPreviewEdge === 'TOP') {
            const guideLeft = state.preview.attachmentOffset * stride;
            guide.style.left = `${guideLeft}px`;
            guide.style.top = `${-stride}px`;
            guide.style.width = `${overlapCount * stride - gap}px`;
            guide.style.height = `${cellSize}px`;
            cardContainer.style.left = `${guideLeft}px`;
            cardContainer.style.top = `${-stride}px`;
          } else if (lastPreviewEdge === 'BOTTOM') {
            const guideLeft = state.preview.attachmentOffset * stride;
            guide.style.left = `${guideLeft}px`;
            guide.style.top = `${matrixExtent + gap}px`;
            guide.style.width = `${overlapCount * stride - gap}px`;
            guide.style.height = `${cellSize}px`;
            cardContainer.style.left = `${guideLeft}px`;
            cardContainer.style.top = `${matrixExtent + gap}px`;
          } else if (lastPreviewEdge === 'LEFT') {
            const guideTop = state.preview.attachmentOffset * stride;
            guide.style.left = `${-stride}px`;
            guide.style.top = `${guideTop}px`;
            guide.style.width = `${cellSize}px`;
            guide.style.height = `${overlapCount * stride - gap}px`;
            cardContainer.style.left = `${-stride}px`;
            cardContainer.style.top = `${guideTop}px`;
          } else {
            const guideTop = state.preview.attachmentOffset * stride;
            guide.style.left = `${matrixExtent + gap}px`;
            guide.style.top = `${guideTop}px`;
            guide.style.width = `${cellSize}px`;
            guide.style.height = `${overlapCount * stride - gap}px`;
            cardContainer.style.left = `${matrixExtent + gap}px`;
            cardContainer.style.top = `${guideTop}px`;
          }
        }
      }
    }

    this.renderHand(state);
    this.updateHeldPosition();
    this.renderStatusOverlay(state);
  }

  private renderHand(state: GameState): void {
    if (!this.handElement) return;
    const handElement = this.handElement;
    
    // Remove cards that are no longer in hand
    const currentCardIds = state.hand.map(c => c.id);
    Array.from(handElement.children).forEach(child => {
      const id = child.getAttribute('data-card-id');
      if (id && !currentCardIds.includes(id)) {
        child.remove();
      }
    });

    const total = state.hand.length;
    const open = 1; // fan openness 0..1 (can tweak)
    
    state.hand.forEach((card, index) => {
      let cardElement = handElement.querySelector(`[data-card-id="${card.id}"]`) as HTMLElement;
      let isNew = false;
      if (!cardElement) {
        isNew = true;
        cardElement = createCardElement(card, '', 'vertical', true);
        cardElement.setAttribute('data-card-id', card.id);
        cardElement.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isAnimating) return;
          this.store.selectCard(card.id);
          this.render();
        });
        handElement.appendChild(cardElement);
      } else {
        // Update full image or blocks
        const fullImage = cardElement.querySelector('.card-full-image') as HTMLImageElement;
        if (!fullImage) {
          const blocks = Array.from(cardElement.querySelectorAll('.card-block')) as HTMLImageElement[];
          card.symbols.forEach((symbol, i) => {
            const expectedSrc = blockAsset(symbol);
            if (blocks[i] && !blocks[i].src.includes(expectedSrc)) {
              blocks[i].src = expectedSrc;
            }
          });
        }
      }

      const isSelected = state.selectedCardIds.includes(card.id);
      const isLastSelected = state.selectedCardIds[state.selectedCardIds.length - 1] === card.id;

      if (isSelected) {
        cardElement.classList.add('selected');
      } else {
        cardElement.classList.remove('selected');
      }

      // If the card is flipped, we want to visually rotate the image 180 degrees
      const fullImage = cardElement.querySelector('.card-full-image') as HTMLImageElement;
      if (fullImage) {
        if (card.isFlipped) {
          fullImage.style.transform = cardElement.classList.contains('render-card-horizontal') ? 'rotate(90deg)' : 'rotate(180deg)';
        } else {
          fullImage.style.transform = cardElement.classList.contains('render-card-horizontal') ? 'rotate(-90deg)' : 'none';
        }
      }

      if (!cardElement.classList.contains('held')) {
        const center = Math.max((total - 1) / 2, 1);
        const offset = index - (total - 1) / 2;
        const t = offset / center; // -1..1
        
        // Base lift pushes the center up and edges down
        const baseLift = -Math.abs(t) * 10;
        // Arc function for the fan
        const f = Math.abs(t); 
        const fanY = (baseLift + f * 20) * open;
        const fanX = offset * 50 * open;
        const angle = offset * (15 / Math.max(total - 1, 1)) * open;

        if (isNew) {
          // DEAL & FAN intro animation for newly dealt cards
          gsap.fromTo(cardElement, {
            x: -360,
            y: 100,
            rotation: -20,
            scale: 0.9,
            transformOrigin: "50% 120%",
            zIndex: index
          }, {
            x: fanX,
            y: fanY,
            rotation: angle,
            scale: 1,
            zIndex: isSelected ? (isLastSelected ? 1100 : 1000 + index) : index,
            duration: 0.6,
            delay: index * 0.05,
            ease: "power3.out",
            overwrite: 'auto'
          });
        } else {
          // Normal state update (e.g. after playing a card)
          gsap.to(cardElement, {
            rotation: angle,
            x: fanX,
            y: fanY,
            xPercent: -50,
            yPercent: 0,
            transformOrigin: '50% 120%',
            scale: 1,
            zIndex: isSelected ? (isLastSelected ? 1100 : 1000 + index) : index,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      }
    });
  }
}
