declare module 'astrowind:config' {
  import type {
    SiteConfig,
    I18NConfig,
    MetaDataConfig,
    AppBlogConfig,
    AppProjectsConfig,
    UIConfig,
    AnalyticsConfig,
    TemplateConfig,
  } from './config';

  export const SITE: SiteConfig;
  export const I18N: I18NConfig;
  export const METADATA: MetaDataConfig;
  export const APP_BLOG: AppBlogConfig;
  export const APP_PROJECTS: AppProjectsConfig;
  /** @deprecated AstroWind's light/dark UI setting; `ui:` was removed from config.yaml. */
  export const UI: UIConfig;
  export const ANALYTICS: AnalyticsConfig;
  export const TEMPLATE: TemplateConfig;
}
