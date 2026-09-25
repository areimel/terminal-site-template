import { APP_PROJECTS } from 'astrowind:config';
import { createContentUtils } from './collections';
import { PROJECTS_BASE, PROJECT_CATEGORY_BASE, PROJECT_PERMALINK_PATTERN } from './permalinks';

const projects = createContentUtils({
  collection: 'project',
  routeParam: 'projects',
  itemProp: 'project',
  permalinkPattern: PROJECT_PERMALINK_PATTERN,
  listBase: PROJECTS_BASE,
  categoryBase: PROJECT_CATEGORY_BASE,
  categoryLinkType: 'project-category',
  perPage: APP_PROJECTS.projectsPerPage,
  isEnabled: APP_PROJECTS.isEnabled,
  isListEnabled: APP_PROJECTS.list.isEnabled,
  isItemEnabled: APP_PROJECTS.project.isEnabled,
  isCategoryEnabled: APP_PROJECTS.category.isEnabled,
});

export const projectsListRobots = APP_PROJECTS.list.robots;
export const projectPostRobots = APP_PROJECTS.project.robots;
export const projectCategoryRobots = APP_PROJECTS.category.robots;

export const findLatestProjects = projects.findLatest;
export const getStaticPathsProjectsList = projects.getStaticPathsList;
export const getStaticPathsProjectPost = projects.getStaticPathsItem;
export const getStaticPathsProjectCategory = projects.getStaticPathsCategory;
