import { getContentStatus, loadContentStatuses } from './contentStatus';

export type CardCatalogGroup = 'basic' | 'tricolor';
export type CardAssetMode = 'full' | 'dynamic';

export interface CardCatalogEntry {
  code: string;
  group: CardCatalogGroup;
  assetMode: CardAssetMode;
  notes?: string;
}

export interface CardCatalogFile {
  cards: CardCatalogEntry[];
}

const DEFAULT_CARD_CATALOG: CardCatalogFile = {
  cards: []
};

export async function loadCardCatalogFile(): Promise<CardCatalogFile> {
  try {
    const [response, statuses] = await Promise.all([
      fetch('/definition/card_catalog.csv'),
      loadContentStatuses()
    ]);
    if (!response.ok) return DEFAULT_CARD_CATALOG;
    const text = await response.text();
    const cards = text
      .trim()
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map((line) => line.split(',').map((part) => part.trim()))
      .map((row) => ({
        code: row[0] ?? '',
        group: (row[1] ?? 'basic') as CardCatalogGroup,
        assetMode: (row[2] ?? 'dynamic') as CardAssetMode,
        notes: row[3] ?? ''
      }))
      .filter((entry) => {
        const status = getContentStatus(statuses, `card:${entry.code}`, 'card');
        return status.implemented && status.enabled && status.shopEnabled;
      });
    return { cards };
  } catch {
    return DEFAULT_CARD_CATALOG;
  }
}
