import fs from 'node:fs';
import path from 'node:path';

import loadConfig from './loadConfig';

/** `site-links.yaml` -> `siteLinks`, `branding.yaml` -> `branding`. */
const toKey = (file: string) =>
  path
    .basename(file, path.extname(file))
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''));

/**
 * Loads every `*.yaml`/`*.yml` file directly inside `dir` (non-recursive), keyed by its
 * camelCased basename. A missing directory yields no content rather than an error.
 */
const loadGlobalContent = async (dir: string) => {
  const data: Record<string, unknown> = {};
  const files: string[] = [];

  if (!fs.existsSync(dir)) return { data, files };

  const names = fs
    .readdirSync(dir)
    .filter((name) => /\.ya?ml$/i.test(name))
    .sort();

  for (const name of names) {
    const file = path.join(dir, name);
    const key = toKey(name);

    if (key in data) {
      throw new Error(`global-content: "${name}" maps to the key "${key}", which another file already uses.`);
    }

    const content = (await loadConfig(file)) ?? {};
    if (typeof content !== 'object' || Array.isArray(content)) {
      throw new Error(`global-content: "${name}" must contain a YAML mapping (key: value pairs) at the top level.`);
    }

    data[key] = content;
    files.push(file);
  }

  return { data, files };
};

export default loadGlobalContent;
