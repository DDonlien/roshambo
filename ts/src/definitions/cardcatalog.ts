import { parseCsvWithHeader } from './csv';

export type CardCatalogGroup = 'basic' | 'tricolor';
export type CardAssetMode = 'full' | 'dynamic';

export interface CardCatalogEntry {
  code: string;
  group: CardCatalogGroup;
  assetMode: CardAssetMode;
  notes?: string;
  shopRatio?: number;
}

export interface CardCatalogFile {
  cards: CardCatalogEntry[];
}

const DEFAULT_CARD_CATALOG: CardCatalogFile = {
  cards: []
};

export async function loadCardCatalogFile(): Promise<CardCatalogFile> {
  try {
    const response = await fetch('/definition/card_definition.csv');
    if (!response.ok) return DEFAULT_CARD_CATALOG;
    const text = await response.text();
    const cards = parseCsvWithHeader(text)
      .map((row) => {
        const code = (row.card_code ?? '').trim();
        const enabled = (row.enabled ?? '1').trim();
        const shopEnabled = (row.shop_enabled ?? '1').trim();
        if (!code) return null;
        if (enabled !== '1') return null;
        if (shopEnabled !== '1') return null;
        const ratio = Number(row.shop_ratio ?? '1');
        const entry: CardCatalogEntry = {
          code,
          group: ((row.group ?? 'basic').trim() || 'basic') as CardCatalogGroup,
          assetMode: ((row.asset_mode ?? 'dynamic').trim() || 'dynamic') as CardAssetMode,
          shopRatio: Number.isFinite(ratio) ? ratio : 1
        };
        if ((row.notes ?? '').trim()) entry.notes = row.notes;
        return entry;
      })
      .filter((entry): entry is CardCatalogEntry => Boolean(entry));
    return { cards };
  } catch {
    return DEFAULT_CARD_CATALOG;
  }
}
