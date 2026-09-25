/**
 * Shared loader for dated content collections (blog posts, projects). `blog.ts` and
 * `projects.ts` are thin wrappers around `createContentUtils`, so both get identical
 * normalization, permalinks, pagination, category pages and related-item scoring.
 */
import type { PaginateFunction } from 'astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post } from '~/types';
import { cleanSlug, getPermalink, trimSlash } from './permalinks';

export interface ContentUtilsOptions {
  collection: 'post' | 'project';
  /** Rest-param name of the page route, e.g. `blog` for `src/pages/[...blog]`. */
  routeParam: string;
  /** Prop name the item page reads, e.g. `post` or `project`. */
  itemProp: string;
  permalinkPattern: string;
  listBase: string;
  categoryBase: string;
  /** `getPermalink` type used for category links (`category` for posts, `project-category` for projects). */
  categoryLinkType: 'category' | 'project-category';
  perPage: number;
  isEnabled: boolean;
  isListEnabled: boolean;
  isItemEnabled: boolean;
  isCategoryEnabled: boolean;
}

export const itemPermalink = (
  pattern: string,
  { id, slug, publishDate, category }: { id: string; slug: string; publishDate: Date; category?: string }
): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const values: Record<string, string> = {
    '%slug%': slug,
    '%id%': id,
    '%category%': category || '',
    '%year%': pad(publishDate.getFullYear(), 4),
    '%month%': pad(publishDate.getMonth() + 1),
    '%day%': pad(publishDate.getDate()),
    '%hour%': pad(publishDate.getHours()),
    '%minute%': pad(publishDate.getMinutes()),
    '%second%': pad(publishDate.getSeconds()),
  };
  const permalink = Object.entries(values).reduce((acc, [token, value]) => acc.replace(token, value), pattern);
  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter(Boolean)
    .join('/');
};

async function normalize(entry: CollectionEntry<'post' | 'project'>, options: ContentUtilsOptions): Promise<Post> {
  const { id, data } = entry;
  const { Content, remarkPluginFrontmatter } = await render(entry);
  const { publishDate: rawPublishDate = new Date(), updateDate: rawUpdateDate, tags: rawTags = [], ...rest } = data;

  const slug = cleanSlug(id);
  const publishDate = new Date(rawPublishDate);
  const categorySlug = rest.category ? cleanSlug(rest.category) : undefined;
  const category = categorySlug
    ? { slug: categorySlug, title: rest.category, permalink: getPermalink(categorySlug, options.categoryLinkType) }
    : undefined;

  return {
    ...rest,
    id,
    slug,
    permalink: itemPermalink(options.permalinkPattern, { id, slug, publishDate, category: category?.slug }),
    publishDate,
    updateDate: rawUpdateDate ? new Date(rawUpdateDate) : undefined,
    category,
    tags: rawTags.map((tag: string) => ({ slug: cleanSlug(tag), title: tag })),
    draft: rest.draft ?? false,
    metadata: rest.metadata ?? {},
    Content,
    readingTime: remarkPluginFrontmatter?.readingTime,
  } as Post;
}

export function createContentUtils(options: ContentUtilsOptions) {
  let cache: Promise<Post[]> | undefined;

  const fetchAll = (): Promise<Post[]> => {
    cache ??= getCollection(options.collection).then(async (entries) =>
      (await Promise.all(entries.map((entry) => normalize(entry, options))))
        .filter((item) => !item.draft)
        .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    );
    return cache;
  };

  const findLatest = async ({ count = 4 }: { count?: number } = {}): Promise<Post[]> =>
    (await fetchAll()).slice(0, count);

  const getStaticPathsList = async ({ paginate }: { paginate: PaginateFunction }) => {
    if (!options.isEnabled || !options.isListEnabled) return [];
    return paginate(await fetchAll(), {
      params: { [options.routeParam]: options.listBase || undefined },
      pageSize: options.perPage,
    });
  };

  const getStaticPathsItem = async () => {
    if (!options.isEnabled || !options.isItemEnabled) return [];
    return (await fetchAll()).map((item) => ({
      params: { [options.routeParam]: item.permalink },
      props: { [options.itemProp]: item },
    }));
  };

  const getStaticPathsCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
    if (!options.isEnabled || !options.isCategoryEnabled) return [];
    const items = await fetchAll();
    const categories = new Map(items.filter((i) => i.category).map((i) => [i.category!.slug, i.category!]));
    return [...categories].flatMap(([slug, category]) =>
      paginate(
        items.filter((item) => item.category?.slug === slug),
        {
          params: { category: slug, [options.routeParam]: options.categoryBase || undefined },
          pageSize: options.perPage,
          props: { category },
        }
      )
    );
  };

  /** Same category scores 5, each shared tag scores 1; highest first. */
  const getRelated = async (original: Post, maxResults = 4): Promise<Post[]> => {
    const originalTags = new Set((original.tags ?? []).map((tag) => tag.slug));
    return (await fetchAll())
      .filter((item) => item.slug !== original.slug)
      .map((item) => ({
        item,
        score:
          (item.category && item.category.slug === original.category?.slug ? 5 : 0) +
          (item.tags ?? []).filter((tag) => originalTags.has(tag.slug)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item);
  };

  return { fetchAll, findLatest, getStaticPathsList, getStaticPathsItem, getStaticPathsCategory, getRelated };
}
