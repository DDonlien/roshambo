export function parseCsvRows(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  return rows;
}

export function parseCsvWithHeader(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text);
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) => {
    const entry: Record<string, string> = {};
    header.forEach((key, index) => {
      entry[key] = row[index] ?? '';
    });
    return entry;
  });
}
