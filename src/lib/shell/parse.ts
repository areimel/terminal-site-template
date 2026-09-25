/**
 * Splits a shell command line into argv tokens.
 *
 * Supports single quotes (literal, no escapes), double quotes (backslash
 * escapes `\"` and `\\`), and backslash escapes outside quotes. Whitespace
 * outside quotes separates tokens. An empty or whitespace-only line yields
 * an empty argv (a no-op).
 */
export function parseLine(line: string): string[] {
  const args: string[] = [];
  let current = '';
  let inToken = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (quote === "'") {
      if (ch === "'") {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }

    if (quote === '"') {
      if (ch === '"') {
        quote = null;
      } else if (ch === '\\' && (line[i + 1] === '"' || line[i + 1] === '\\')) {
        current += line[i + 1];
        i++;
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      inToken = true;
      continue;
    }

    if (ch === '\\' && i + 1 < line.length) {
      current += line[i + 1];
      inToken = true;
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      if (inToken) {
        args.push(current);
        current = '';
        inToken = false;
      }
      continue;
    }

    current += ch;
    inToken = true;
  }

  if (inToken || current.length > 0) {
    args.push(current);
  }

  return args;
}
