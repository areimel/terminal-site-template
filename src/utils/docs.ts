import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type DocEntry = CollectionEntry<'docs'>;

/** Section display order for the sidebar file tree and the linear reading order used by prev/next. */
export const DOC_SECTION_ORDER = ['Getting started', 'Guides', 'Components', 'Reference'] as const;

export interface DocSectionGroup {
  section: (typeof DOC_SECTION_ORDER)[number];
  docs: DocEntry[];
}

const sortDocs = (docs: DocEntry[]): DocEntry[] =>
  [...docs].sort((a, b) => {
    const sectionDiff = DOC_SECTION_ORDER.indexOf(a.data.section) - DOC_SECTION_ORDER.indexOf(b.data.section);
    if (sectionDiff !== 0) return sectionDiff;
    return a.data.order - b.data.order;
  });

/** All non-draft docs, sorted by section order then `order`. This is the canonical reading order. */
export const getDocs = async (): Promise<DocEntry[]> => {
  const docs = await getCollection('docs', ({ data }) => !data.draft);
  return sortDocs(docs);
};

/** Docs grouped by section (in section order), for the sidebar file tree. Empty sections are omitted. */
export const groupDocsBySection = async (): Promise<DocSectionGroup[]> => {
  const docs = await getDocs();
  return DOC_SECTION_ORDER.map((section) => ({
    section,
    docs: docs.filter((doc) => doc.data.section === section),
  })).filter((group) => group.docs.length > 0);
};

/** The previous/next doc in reading order, for the bottom-of-page prev/next links. */
export const getPrevNext = async (id: string): Promise<{ prev: DocEntry | null; next: DocEntry | null }> => {
  const docs = await getDocs();
  const index = docs.findIndex((doc) => doc.id === id);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? docs[index - 1] : null,
    next: index < docs.length - 1 ? docs[index + 1] : null,
  };
};

/** The route for a doc id. `index` is the /docs landing page; everything else is /docs/<id>. */
export const docHref = (id: string): string => (id === 'index' ? '/docs' : `/docs/${id}`);
