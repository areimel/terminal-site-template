declare module 'astrowind:config' {
  import type {
    SiteConfig,
    I18NConfig,
    MetaDataConfig,
    AppBlogConfig,
    AppProjectsConfig,
    AnalyticsConfig,
    TemplateConfig,
  } from './utils/configBuilder';

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const METADATA: MetaDataConfig;
  export const APP_BLOG: AppBlogConfig;
  export const APP_PROJECTS: AppProjectsConfig;
  export const ANALYTICS: AnalyticsConfig;
  export const TEMPLATE: TemplateConfig;
}
