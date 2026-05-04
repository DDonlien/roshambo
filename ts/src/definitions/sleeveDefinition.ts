import { Card, ClashResult, RPS } from '../types';
import { parseCsvWithHeader } from './csv';
import {
  isFlush,
  isFourOfAKind,
  isPair,
  isStraight,
  isThreeOfAKind
} from './shared-effects';

export type SleeveRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type LocalizedText = Partial<Record<'EN' | 'ZH' | 'ZH_TW' | 'JA', string>>;

export type SleevePattern = 'pair' | 'three_kind' | 'four_kind' | 'straight' | 'flush';

export type SleeveEffectDefinition =
  | { type: 'score_flat'; value: number }
  | { type: 'score_mult'; value: number }
  | { type: 'score_flat_random'; min: number; max: number }
  | { type: 'score_flat_per_attacker_symbol_win'; symbol: RPS; value: number }
  | { type: 'score_flat_per_blank_tie_or_win'; value: number }
  | { type: 'score_flat_per_chained_win'; value: number }
  | { type: 'score_flat_if_pattern'; pattern: SleevePattern; value: number }
  | { type: 'score_mult_if_pattern'; pattern: SleevePattern; value: number }
  | { type: 'score_mult_per_symbol_in_card'; symbol: RPS; value: number }
  | { type: 'score_mult_per_empty_sleeve_slot'; value: number }
  | { type: 'score_flat_per_owned_sleeve'; value: number }
  | { type: 'score_flat_per_remaining_deal'; value: number }
  | { type: 'score_flat_if_no_deals_left'; value: number }
  | { type: 'score_mult_every_n_hands'; interval: number; value: number }
  | { type: 'score_flat_per_remaining_deck_card'; value: number }
  | { type: 'score_flat_per_chips'; value: number; step?: number }
  | { type: 'score_mult_per_chips'; value: number; step?: number }
  | { type: 'score_mult_if_final_hand'; value: number }
  | { type: 'chips_end_level'; value: number }
  | { type: 'chips_interest_per_5'; value: number }
  | { type: 'bonus_deals_per_level'; value: number }
  | { type: 'chips_per_attacker_symbol_win'; symbol: RPS; value: number; chance?: number }
  | { type: 'score_mult_per_attacker_symbol_win'; symbol: RPS; value: number; chance?: number };

export interface SleeveDefinition {
  id: string;
  name: string;
  shortName: string;
  nameI18n?: LocalizedText;
  shortNameI18n?: LocalizedText;
  rarity: SleeveRarity;
  cost: number;
  accent: string;
  description: string;
  descriptionI18n?: LocalizedText;
  shopRatio: number;
  comboTags: string[];
  effects: SleeveEffectDefinition[];
}

export interface SleeveDefinitionFile {
  version: number;
  slotLimit: number;
  sleeves: SleeveDefinition[];
}

const DEFAULT_SLEEVE_DEFINITION: SleeveDefinitionFile = {
  version: 1,
  slotLimit: 5,
  sleeves: []
};

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseEffects(value: string | undefined): SleeveEffectDefinition[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as SleeveEffectDefinition[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowValue(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return '';
}

function isValidationEnabled(row: Record<string, string>): boolean {
  if (!('validation' in row) && !('r' in row)) return true;
  return rowValue(row, 'validation', 'r') === '1';
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseSleeveDefinitionCsv(text: string): SleeveDefinition[] {
  return parseCsvWithHeader(text)
    .filter(isValidationEnabled)
    .map((row) => {
      const nameZh = rowValue(row, 'n', 'name_zh');
      const descriptionZh = rowValue(row, 'd', 'description_zh');
      return {
        id: row.id ?? '',
        name: row.name_en || nameZh || 'Unnamed Sleeve',
        shortName: row.short_name_en || row.short_name_zh || row.name_en || nameZh || '',
        nameI18n: {
          EN: row.name_en,
          ZH: nameZh,
          ZH_TW: row.name_zh_tw,
          JA: row.name_ja
        },
        shortNameI18n: {
          EN: row.short_name_en,
          ZH: row.short_name_zh || nameZh,
          ZH_TW: row.short_name_zh_tw,
          JA: row.short_name_ja
        },
        rarity: (row.rarity || 'common') as SleeveRarity,
        cost: toNumber(row.cost, 0),
        accent: row.accent || '#ffd166',
        description: row.description_en || descriptionZh || '',
        descriptionI18n: {
          EN: row.description_en,
          ZH: descriptionZh,
          ZH_TW: row.description_zh_tw,
          JA: row.description_ja
        },
        shopRatio: Math.max(0, toNumber(rowValue(row, 'ratio'), 1)),
        comboTags: parseTags(rowValue(row, 'tag')),
        effects: parseEffects(row.effects)
      };
    })
    .filter((sleeve) => sleeve.id && sleeve.effects.length > 0);
}

export interface SleeveRuntimeContext {
  card: Card;
  result: ClashResult;
  ownedSleeveCount: number;
  emptySleeveSlots: number;
  dealsLeft: number;
  remainingDeckCount: number;
  currentChips: number;
  handsPlayedThisRun: number;
  isFinalHand: boolean;
  random: () => number;
}

export interface SleeveClashBonus {
  flatScore: number;
  multiplier: number;
  chipsDelta: number;
  bonusDealsPerLevel: number;
  bonusInterestPer5Chips: number;
  triggers: Array<{
    sleeveDefinitionId: string;
    kind: 'score' | 'multiplier' | 'chips';
    value: number;
    r: number;
    c: number;
    laneIndex: number;
  }>;
}

export async function loadSleeveDefinitionFile(): Promise<SleeveDefinitionFile> {
  try {
    const response = await fetch('/definition/sleeve_definition.csv');
    if (!response.ok) return DEFAULT_SLEEVE_DEFINITION;
    const sleeves = parseSleeveDefinitionCsv(await response.text());
    return {
      ...DEFAULT_SLEEVE_DEFINITION,
      version: 2,
      sleeves
    };
  } catch {
    return DEFAULT_SLEEVE_DEFINITION;
  }
}

function matchesPattern(card: Card, pattern: SleevePattern): boolean {
  if (pattern === 'pair') return isPair(card);
  if (pattern === 'three_kind') return isThreeOfAKind(card);
  if (pattern === 'four_kind') return isFourOfAKind(card);
  if (pattern === 'straight') return isStraight(card);
  return isFlush(card);
}

export function applySleeveEffects(definition: SleeveDefinition, context: SleeveRuntimeContext): SleeveClashBonus {
  const bonus: SleeveClashBonus = {
    flatScore: 0,
    multiplier: 1,
    chipsDelta: 0,
    bonusDealsPerLevel: 0,
    bonusInterestPer5Chips: 0,
    triggers: []
  };

  definition.effects.forEach((effect) => {
    switch (effect.type) {
      case 'score_flat':
        bonus.flatScore += effect.value;
        break;
      case 'score_mult':
        bonus.multiplier *= effect.value;
        break;
      case 'score_flat_random':
        bonus.flatScore += Math.floor(context.random() * (effect.max - effect.min + 1)) + effect.min;
        break;
      case 'score_flat_per_attacker_symbol_win':
        (context.result.captureEvents ?? []).forEach((event) => {
          if (event.attacker !== effect.symbol || event.defender === RPS.BLANK) return;
          bonus.flatScore += effect.value;
          bonus.triggers.push({
            sleeveDefinitionId: definition.id,
            kind: 'score',
            value: effect.value,
            r: event.r,
            c: event.c,
            laneIndex: event.laneIndex
          });
        });
        break;
      case 'score_flat_per_blank_tie_or_win': {
        (context.result.captureEvents ?? []).forEach((event) => {
          if (event.defender !== RPS.BLANK) return;
          bonus.flatScore += effect.value;
          bonus.triggers.push({
            sleeveDefinitionId: definition.id,
            kind: 'score',
            value: effect.value,
            r: event.r,
            c: event.c,
            laneIndex: event.laneIndex
          });
        });
        (context.result.tieEvents ?? []).forEach((event) => {
          if (event.attacker !== RPS.BLANK && event.defender !== RPS.BLANK) return;
          bonus.flatScore += effect.value;
          bonus.triggers.push({
            sleeveDefinitionId: definition.id,
            kind: 'score',
            value: effect.value,
            r: event.r,
            c: event.c,
            laneIndex: event.laneIndex
          });
        });
        break;
      }
      case 'score_flat_per_chained_win': {
        const winsByLane = new Map<number, number>();
        (context.result.captureEvents ?? []).forEach((event) => {
          winsByLane.set(event.laneIndex, (winsByLane.get(event.laneIndex) ?? 0) + 1);
          if ((winsByLane.get(event.laneIndex) ?? 0) <= 1) return;
          bonus.flatScore += effect.value;
          bonus.triggers.push({
            sleeveDefinitionId: definition.id,
            kind: 'score',
            value: effect.value,
            r: event.r,
            c: event.c,
            laneIndex: event.laneIndex
          });
        });
        break;
      }
      case 'score_flat_if_pattern':
        if (matchesPattern(context.card, effect.pattern)) bonus.flatScore += effect.value;
        break;
      case 'score_mult_if_pattern':
        if (matchesPattern(context.card, effect.pattern)) bonus.multiplier *= effect.value;
        break;
      case 'score_mult_per_symbol_in_card': {
        const count = context.card.symbols.filter((symbol) => symbol === effect.symbol).length;
        bonus.multiplier *= effect.value ** count;
        break;
      }
      case 'score_mult_per_empty_sleeve_slot': {
        const factor = Math.max(1, context.emptySleeveSlots * effect.value);
        bonus.multiplier *= factor;
        break;
      }
      case 'score_flat_per_owned_sleeve':
        bonus.flatScore += context.ownedSleeveCount * effect.value;
        break;
      case 'score_flat_per_remaining_deal':
        bonus.flatScore += context.dealsLeft * effect.value;
        break;
      case 'score_flat_if_no_deals_left':
        if (context.dealsLeft === 0) bonus.flatScore += effect.value;
        break;
      case 'score_mult_every_n_hands':
        if ((context.handsPlayedThisRun + 1) % effect.interval === 0) bonus.multiplier *= effect.value;
        break;
      case 'score_flat_per_remaining_deck_card':
        bonus.flatScore += context.remainingDeckCount * effect.value;
        break;
      case 'score_flat_per_chips': {
        const divisor = effect.step ?? 1;
        bonus.flatScore += Math.floor(context.currentChips / divisor) * effect.value;
        break;
      }
      case 'score_mult_per_chips': {
        const divisor = effect.step ?? 1;
        const count = Math.floor(context.currentChips / divisor);
        bonus.multiplier *= effect.value ** count;
        break;
      }
      case 'score_mult_if_final_hand':
        if (context.isFinalHand) bonus.multiplier *= effect.value;
        break;
      case 'chips_end_level':
        bonus.chipsDelta += effect.value;
        break;
      case 'chips_interest_per_5':
        bonus.bonusInterestPer5Chips += effect.value;
        break;
      case 'bonus_deals_per_level':
        bonus.bonusDealsPerLevel += effect.value;
        break;
      case 'chips_per_attacker_symbol_win':
        (context.result.captureEvents ?? []).forEach((event) => {
          if (event.attacker !== effect.symbol || event.defender === RPS.BLANK) return;
          if (effect.chance && context.random() >= effect.chance) return;
          bonus.chipsDelta += effect.value;
          bonus.triggers.push({
            sleeveDefinitionId: definition.id,
            kind: 'chips',
            value: effect.value,
            r: event.r,
            c: event.c,
            laneIndex: event.laneIndex
          });
        });
        break;
      case 'score_mult_per_attacker_symbol_win':
        (context.result.captureEvents ?? []).forEach((event) => {
          if (event.attacker !== effect.symbol || event.defender === RPS.BLANK) return;
          if (effect.chance && context.random() >= effect.chance) return;
          bonus.multiplier *= effect.value;
          bonus.triggers.push({
            sleeveDefinitionId: definition.id,
            kind: 'multiplier',
            value: effect.value,
            r: event.r,
            c: event.c,
            laneIndex: event.laneIndex
          });
        });
        break;
    }
  });

  return bonus;
}
