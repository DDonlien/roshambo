import { InitialConfig } from '../types';
import { getContentStatus, loadContentStatuses } from './contentStatus';

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

function parseDeckCatalog(text: string): DeckCatalogRow[] {
  return text
    .trim()
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split(',').map((part) => part.trim()))
    .map((row) => ({
      id: row[0] ?? '',
      name: row[1] ?? 'Unnamed Deck',
      unlockRef: row[2] ?? 'unlock:starter',
      unlockDocument: {
        title: row[3] ?? '',
        description: row[4] ?? ''
      },
      startingConfig: {
        chips: toNumber(row[5], 10),
        interestRate: toNumber(row[6], 0.2),
        dealsLeft: toNumber(row[7], 4),
        shufflesLeft: toNumber(row[8], 4)
      }
    }));
}

function parseDeckCards(text: string): Map<string, DeckCardEntry[]> {
  const map = new Map<string, DeckCardEntry[]>();
  text
    .trim()
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split(',').map((part) => part.trim()))
    .forEach((row) => {
      const deckId = row[0] ?? '';
      const code = row[1] ?? '000';
      const count = toNumber(row[2], 0);
      if (!deckId) return;
      const entries = map.get(deckId) ?? [];
      entries.push({ code, count });
      map.set(deckId, entries);
    });
  return map;
}

export async function loadDeckDefinitionFile(): Promise<DeckDefinitionFile> {
  try {
    const [catalogResponse, cardsResponse, effectsResponse, statuses] = await Promise.all([
      fetch('/definition/deck_catalog.csv'),
      fetch('/definition/deck_cards.csv'),
      fetch('/definition/deck_effects.json'),
      loadContentStatuses()
    ]);
    if (!catalogResponse.ok || !cardsResponse.ok || !effectsResponse.ok) return DEFAULT_DECK_DEFINITION;

    const [catalogText, cardsText, effectsJson] = await Promise.all([
      catalogResponse.text(),
      cardsResponse.text(),
      effectsResponse.json()
    ]);

    const catalogRows = parseDeckCatalog(catalogText);
    const cardsByDeckId = parseDeckCards(cardsText);
    const effectsFile = effectsJson as DeckEffectsFile;
    const effectsByDeckId = new Map<string, DeckEffectDefinition[]>(
      (effectsFile.decks ?? []).map((entry) => [entry.deckId, entry.effects ?? []])
    );

    const decks = catalogRows
      .filter((deck) => {
        const status = getContentStatus(statuses, deck.id, 'deck');
        return status.implemented && status.enabled;
      })
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
