import { APP_BLOG } from 'astrowind:config';
import { createContentUtils } from './collections';
import { BLOG_BASE, CATEGORY_BASE, POST_PERMALINK_PATTERN } from './permalinks';

const blog = createContentUtils({
  collection: 'post',
  routeParam: 'blog',
  itemProp: 'post',
  permalinkPattern: POST_PERMALINK_PATTERN,
  listBase: BLOG_BASE,
  categoryBase: CATEGORY_BASE,
  categoryLinkType: 'category',
  perPage: APP_BLOG.postsPerPage,
  isEnabled: APP_BLOG.isEnabled,
  isListEnabled: APP_BLOG.list.isEnabled,
  isItemEnabled: APP_BLOG.post.isEnabled,
  isCategoryEnabled: APP_BLOG.category.isEnabled,
});

export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;

export const fetchPosts = blog.fetchAll;
export const findLatestPosts = blog.findLatest;
export const getStaticPathsBlogList = blog.getStaticPathsList;
export const getStaticPathsBlogPost = blog.getStaticPathsItem;
export const getStaticPathsBlogCategory = blog.getStaticPathsCategory;
export const getRelatedPosts = blog.getRelated;
