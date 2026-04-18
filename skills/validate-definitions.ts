import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

type JsonObject = Record<string, unknown>;

async function readJson(filePath: string): Promise<JsonObject> {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as JsonObject;
}

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  const root = process.cwd();
  const dir = join(root, 'ts', 'public', 'definition');

  const deck = await readJson(join(dir, 'deckdefinition.json'));
  const sleeves = await readJson(join(dir, 'sleevedefinition.json'));
  const gifts = await readJson(join(dir, 'giftcarddefinition.json'));

  assert(typeof deck.version === 'number', 'deckdefinition.json: version must be a number');
  assert(Array.isArray(deck.decks), 'deckdefinition.json: decks must be an array');

  assert(typeof sleeves.version === 'number', 'sleevedefinition.json: version must be a number');
  assert(Array.isArray(sleeves.sleeves), 'sleevedefinition.json: sleeves must be an array');

  assert(typeof gifts.version === 'number', 'giftcarddefinition.json: version must be a number');
  assert(Array.isArray(gifts.giftcards), 'giftcarddefinition.json: giftcards must be an array');

  process.stdout.write('OK\n');
}

void main();
