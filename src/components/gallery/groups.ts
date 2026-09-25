/**
 * Component gallery metadata: one-line descriptions per `src/components/<group>` folder, plus the
 * display order for the `/components` page.
 *
 * Groups are discovered at build time from `_demo/<Group>Demo.astro` files (see
 * `src/pages/components.astro`), so this file only needs a description entry per group - nothing
 * here has to be kept manually in sync with the component list itself. An unrecognized group
 * (e.g. a brand-new one that hasn't been documented yet) falls back to its folder name as the
 * description and sorts after every known group, alphabetically.
 */

/** Matches the "Folder layout" order in the design spec, so the gallery reads top to bottom the
 * same way the codebase is organized. */
const GROUP_ORDER = [
  'core',
  'content',
  'media',
  'effects',
  'forms',
  'feedback',
  'data',
  'navigation',
  'sections',
  'shell',
] as const;

const GROUP_DESCRIPTIONS: Record<string, string> = {
  core: 'The base primitives - panels, buttons, headings - everything else in the kit builds on these.',
  content: 'Long-form and structured content: prose, code samples, cards, quotes, callouts.',
  media: 'Images and embeds with the terminal kit’s CRT and ASCII framing.',
  effects: 'Boot sequence, CRT overlay, and text-decode animations - each one can be switched off.',
  forms: 'Inputs, selects, toggles, and the form wrapper that handles submission and validation state.',
  feedback: 'Modals, toasts, tooltips, alerts, and other transient, in-the-moment UI.',
  data: 'Tables, meters, and readouts for displaying numbers, stats, and streaming logs.',
  navigation: 'Sidebars, tabs, breadcrumbs, pagination, and the theme/effects controls.',
  sections: 'Page-level building blocks composed from the primitives above: heroes, grids, CTAs.',
  shell: 'The interactive terminal shell, embeddable inline or full-screen.',
};

/** One line describing what a component group is for. Falls back to the group's folder name. */
export function groupDescription(group: string): string {
  return GROUP_DESCRIPTIONS[group] ?? group;
}

/**
 * Sorts group keys by the canonical architecture order, then alphabetically for anything not in
 * that list (e.g. a group added after this file was last updated).
 */
export function sortGroups(groups: string[]): string[] {
  const rank = (group: string): number => {
    const index = GROUP_ORDER.indexOf(group as (typeof GROUP_ORDER)[number]);
    return index === -1 ? GROUP_ORDER.length : index;
  };

  return [...groups].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
