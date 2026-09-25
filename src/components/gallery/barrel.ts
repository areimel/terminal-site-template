/**
 * Parses a group's `index.ts` barrel source to list what it exports, so the `/components` gallery
 * can show an accurate `import { ... } from '~/components/<group>'` line without hand-maintaining
 * a duplicate list anywhere. Handles both re-exported components (`export { default as Panel }
 * from './Panel.astro'`) and plain named re-exports (`export { setBarValue } from './ascii-bar'`).
 */
export function parseBarrelExports(source: string): string[] {
  const names: string[] = [];
  const exportBlock = /export\s*\{([^}]+)\}/g;

  let match: RegExpExecArray | null;
  while ((match = exportBlock.exec(source))) {
    for (const part of match[1].split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const asMatch = trimmed.match(/\bas\s+(\w+)$/);
      names.push(asMatch ? asMatch[1] : trimmed);
    }
  }

  return names;
}

/** Builds the sample import line shown in each gallery group's CodeBlock. */
export function importLineFor(group: string, exportNames: string[]): string {
  return `import { ${exportNames.join(', ')} } from '~/components/${group}';`;
}
