import { parseCsvWithHeader } from './csv';

export type GiftCardTiming = 'prepare_level';
export type LocalizedText = Partial<Record<'EN' | 'ZH' | 'ZH_TW' | 'JA', string>>;

export type GiftCardEffectDefinition =
  | { type: 'copy_last_used' }
  | { type: 'spawn_random_giftcards'; count: number }
  | { type: 'spawn_random_playmats'; count: number }
  | { type: 'double_money_cap'; cap: number }
  | { type: 'add_random_sleeve'; count: number };

export interface GiftCardDefinition {
  id: string;
  name: string;
  shortName: string;
  nameI18n?: LocalizedText;
  shortNameI18n?: LocalizedText;
  timing: GiftCardTiming;
  cost: number;
  accent: string;
  description: string;
  descriptionI18n?: LocalizedText;
  effect: GiftCardEffectDefinition;
}

export interface GiftCardDefinitionFile {
  version: number;
  inventoryLimit: number;
  giftcards: GiftCardDefinition[];
}

const DEFAULT_GIFTCARD_DEFINITION: GiftCardDefinitionFile = {
  version: 1,
  inventoryLimit: 5,
  giftcards: []
};

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseEffect(value: string | undefined): GiftCardEffectDefinition | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as GiftCardEffectDefinition;
  } catch {
    return null;
  }
}

function parseGiftCardDefinitionCsv(text: string): GiftCardDefinition[] {
  return parseCsvWithHeader(text)
    .filter((row) => (row.enabled ?? '1').trim() === '1')
    .map((row): GiftCardDefinition | null => {
      const effect = parseEffect(row.effect);
      if (!effect) return null;
      return {
        id: row.id ?? '',
        name: row.name_en || row.name_zh || 'Unnamed Gift Card',
        shortName: row.short_name_en || row.short_name_zh || row.name_en || row.name_zh || '',
        nameI18n: {
          EN: row.name_en,
          ZH: row.name_zh,
          ZH_TW: row.name_zh_tw,
          JA: row.name_ja
        },
        shortNameI18n: {
          EN: row.short_name_en,
          ZH: row.short_name_zh,
          ZH_TW: row.short_name_zh_tw,
          JA: row.short_name_ja
        },
        timing: (row.timing || 'prepare_level') as GiftCardTiming,
        cost: toNumber(row.cost, 0),
        accent: row.accent || '#f4a261',
        description: row.description_en || row.description_zh || '',
        descriptionI18n: {
          EN: row.description_en,
          ZH: row.description_zh,
          ZH_TW: row.description_zh_tw,
          JA: row.description_ja
        },
        effect
      };
    })
    .filter((giftcard): giftcard is GiftCardDefinition => Boolean(giftcard?.id));
}

export async function loadGiftCardDefinitionFile(): Promise<GiftCardDefinitionFile> {
  try {
    const response = await fetch('/definition/giftcard_definition.csv');
    if (!response.ok) return DEFAULT_GIFTCARD_DEFINITION;
    const giftcards = parseGiftCardDefinitionCsv(await response.text());
    return {
      ...DEFAULT_GIFTCARD_DEFINITION,
      version: 2,
      giftcards
    };
  } catch {
    return DEFAULT_GIFTCARD_DEFINITION;
  }
}
