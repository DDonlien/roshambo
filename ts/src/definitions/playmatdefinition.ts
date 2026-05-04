import { RPS } from '../types';
import { parseCsvWithHeader } from './csv';

export type LocalizedText = Partial<Record<'EN' | 'ZH' | 'ZH_TW' | 'JA', string>>;
export type PlaymatTiming = 'playing';

export type PlaymatEffectDefinition =
  | { type: 'transform_selected_to_symbol'; count: number; symbol: RPS }
  | { type: 'increase_selected_card_weight'; count: number; amount: number }
  | { type: 'destroy_selected_cards'; count: number }
  | { type: 'copy_right_card_to_left_card' };

export interface PlaymatDefinition {
  id: string;
  name: string;
  shortName: string;
  nameI18n?: LocalizedText;
  shortNameI18n?: LocalizedText;
  timing: PlaymatTiming;
  cost: number;
  accent: string;
  description: string;
  descriptionI18n?: LocalizedText;
  effect: PlaymatEffectDefinition;
}

export interface PlaymatDefinitionFile {
  version: number;
  inventoryLimit: number;
  playmats: PlaymatDefinition[];
}

const DEFAULT_PLAYMAT_DEFINITION: PlaymatDefinitionFile = {
  version: 1,
  inventoryLimit: 5,
  playmats: []
};

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseEffect(value: string | undefined): PlaymatEffectDefinition | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as PlaymatEffectDefinition;
  } catch {
    return null;
  }
}

function parsePlaymatDefinitionCsv(text: string): PlaymatDefinition[] {
  return parseCsvWithHeader(text)
    .filter((row) => (row.enabled ?? '1').trim() === '1')
    .map((row): PlaymatDefinition | null => {
      const effect = parseEffect(row.effect);
      if (!effect) return null;
      return {
        id: row.id ?? '',
        name: row.name_en || row.name_zh || 'Unnamed Playmat',
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
        timing: (row.timing || 'playing') as PlaymatTiming,
        cost: toNumber(row.cost, 0),
        accent: row.accent || '#9b5de5',
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
    .filter((playmat): playmat is PlaymatDefinition => Boolean(playmat?.id));
}

export async function loadPlaymatDefinitionFile(): Promise<PlaymatDefinitionFile> {
  try {
    const response = await fetch('/definition/playmat_definition.csv');
    if (!response.ok) return DEFAULT_PLAYMAT_DEFINITION;
    const playmats = parsePlaymatDefinitionCsv(await response.text());
    return {
      ...DEFAULT_PLAYMAT_DEFINITION,
      playmats
    };
  } catch {
    return DEFAULT_PLAYMAT_DEFINITION;
  }
}
