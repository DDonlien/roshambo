import { InitialConfig } from '../types';
import { parseCsvRows } from './csv';

export interface UnlockDocument {
  title: string;
  description?: string;
}

export interface DeckCardEntry {
  code: string;
  count: number;
}

export interface DeckEffectDefinition {
  type: string;
  [key: string]: unknown;
}

export interface DeckDefinition {
  id: string;
  name: string;
  unlockRef: string;
  unlockDocument?: UnlockDocument;
  startingConfig: InitialConfig;
  cards: DeckCardEntry[];
  effects: DeckEffectDefinition[];
}

export interface DeckDefinitionFile {
  version: number;
  decks: DeckDefinition[];
}

interface DeckCatalogRow {
  id: string;
  name: string;
  unlockRef: string;
  unlockDocument?: UnlockDocument;
  startingConfig: InitialConfig;
}

interface DeckEffectsFile {
  version: number;
  decks: Array<{
    deckId: string;
    effects?: DeckEffectDefinition[];
  }>;
}

const DEFAULT_DECK_DEFINITION: DeckDefinitionFile = {
  version: 1,
  decks: [
    {
      id: 'deck:pinpoint',
      name: 'Pinpoint',
      unlockRef: 'unlock:starter',
      unlockDocument: {
        title: 'Starter',
        description: 'Default unlocked.'
      },
      startingConfig: {
        chips: 10,
        interestRate: 0.2,
        dealsLeft: 4,
        shufflesLeft: 4
      },
      cards: [
        { code: '100', count: 3 },
        { code: '300', count: 3 },
        { code: '400', count: 3 }
      ],
      effects: []
    }
  ]
};

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return false;
  return fallback;
}

function normalizeCardCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const noPrefix = trimmed.startsWith('card:') ? trimmed.slice('card:'.length) : trimmed;
  const upper = noPrefix.toUpperCase();
  if (!/^[01347O]{3}$/.test(upper)) return null;
  return upper;
}

function parseDeckDefinitionCsv(text: string): { catalogRows: DeckCatalogRow[]; cardsByDeckId: Map<string, DeckCardEntry[]> } {
  const rows = parseCsvRows(text);
  const header = rows[0] ?? [];
  const deckIds = header.slice(1).filter(Boolean);

  const valueByKey = new Map<string, Map<string, string>>();
  rows.slice(1).forEach((row) => {
    const key = (row[0] ?? '').trim();
    if (!key) return;
    const map = new Map<string, string>();
    deckIds.forEach((deckId, index) => {
      map.set(deckId, (row[index + 1] ?? '').trim());
    });
    valueByKey.set(key, map);
  });

  const metaKeys = new Set([
    'name',
    'enabled',
    'unlock_ref',
    'unlock_title',
    'unlock_description',
    'starting_chips',
    'starting_interest_rate',
    'starting_deals',
    'starting_shuffles',
    'effects_description'
  ]);

  const cardsByDeckId = new Map<string, DeckCardEntry[]>();
  rows.slice(1).forEach((row) => {
    const key = (row[0] ?? '').trim();
    if (!key || metaKeys.has(key)) return;
    const code = normalizeCardCode(key);
    if (!code) return;
    deckIds.forEach((deckId, index) => {
      const count = toNumber(row[index + 1], 0);
      if (count <= 0) return;
      const entries = cardsByDeckId.get(deckId) ?? [];
      entries.push({ code, count });
      cardsByDeckId.set(deckId, entries);
    });
  });

  const catalogRows: DeckCatalogRow[] = deckIds.map((deckId) => {
    const get = (key: string): string => valueByKey.get(key)?.get(deckId) ?? '';
    const name = get('name') || deckId;
    return {
      id: deckId,
      name,
      unlockRef: get('unlock_ref') || 'unlock:starter',
      unlockDocument: {
        title: get('unlock_title') || '',
        description: get('unlock_description') || ''
      },
      startingConfig: {
        chips: toNumber(get('starting_chips'), 10),
        interestRate: toNumber(get('starting_interest_rate'), 0.2),
        dealsLeft: toNumber(get('starting_deals'), 4),
        shufflesLeft: toNumber(get('starting_shuffles'), 4)
      }
    };
  }).filter((deck) => parseBoolean(valueByKey.get('enabled')?.get(deck.id), true));

  return { catalogRows, cardsByDeckId };
}

export async function loadDeckDefinitionFile(): Promise<DeckDefinitionFile> {
  try {
    const [definitionResponse, effectsResponse] = await Promise.all([
      fetch('/definition/deck_definition.csv'),
      fetch('/definition/deck_effects.json')
    ]);
    if (!definitionResponse.ok || !effectsResponse.ok) return DEFAULT_DECK_DEFINITION;

    const [definitionText, effectsJson] = await Promise.all([
      definitionResponse.text(),
      effectsResponse.json()
    ]);

    const { catalogRows, cardsByDeckId } = parseDeckDefinitionCsv(definitionText);
    const effectsFile = effectsJson as DeckEffectsFile;
    const effectsByDeckId = new Map<string, DeckEffectDefinition[]>(
      (effectsFile.decks ?? []).map((entry) => [entry.deckId, entry.effects ?? []])
    );

    const decks = catalogRows
      .map((deck) => ({
        id: deck.id,
        name: deck.name,
        unlockRef: deck.unlockRef,
        unlockDocument: deck.unlockDocument,
        startingConfig: deck.startingConfig,
        cards: cardsByDeckId.get(deck.id) ?? [],
        effects: effectsByDeckId.get(deck.id) ?? []
      }))
      .filter((deck) => deck.cards.length > 0);

    if (decks.length === 0) return DEFAULT_DECK_DEFINITION;
    return {
      version: Number.isFinite(effectsFile.version) ? effectsFile.version : 1,
      decks
    };
  } catch {
    return DEFAULT_DECK_DEFINITION;
  }
}

export function getDeckById(defs: DeckDefinitionFile, deckId: string): DeckDefinition | null {
  return defs.decks.find((deck) => deck.id === deckId) ?? null;
}

export interface UnlockContext {
  flags: Record<string, boolean>;
}

export function isDeckUnlocked(deck: DeckDefinition, context: UnlockContext): boolean {
  if (deck.unlockRef === 'unlock:starter') return true;
  return Boolean(context.flags[deck.unlockRef]);
}
