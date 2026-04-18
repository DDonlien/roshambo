export interface ContentStatusRow {
  id: string;
  type: string;
  implemented: boolean;
  enabled: boolean;
  shopEnabled: boolean;
  notes?: string;
}

let cachedStatusesPromise: Promise<ContentStatusRow[]> | null = null;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
}

function parseCsvRows(text: string): string[][] {
  return text
    .trim()
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split(',').map((part) => part.trim()));
}

export async function loadContentStatuses(): Promise<ContentStatusRow[]> {
  if (cachedStatusesPromise) return cachedStatusesPromise;

  cachedStatusesPromise = (async () => {
    try {
      const response = await fetch('/definition/content_status.csv');
      if (!response.ok) return [];
      const text = await response.text();
      return parseCsvRows(text).map((row) => ({
        id: row[0] ?? '',
        type: row[1] ?? '',
        implemented: parseBoolean(row[2], true),
        enabled: parseBoolean(row[3], true),
        shopEnabled: parseBoolean(row[4], true),
        notes: row[5] ?? ''
      }));
    } catch {
      return [];
    }
  })();

  return cachedStatusesPromise;
}

export function getContentStatus(
  statuses: ContentStatusRow[],
  id: string,
  type: string
): ContentStatusRow {
  return statuses.find((status) => status.id === id && status.type === type) ?? {
    id,
    type,
    implemented: true,
    enabled: true,
    shopEnabled: true,
    notes: ''
  };
}
