declare module 'astrowind:config' {
  // Inline import() types: a relative `import type` declaration isn't allowed inside an ambient
  // module (TS2439), and with skipLibCheck that silently degraded every export to `any`.

  export const GLOBAL_CONTENT: import('./utils/configBuilder').GlobalContent;
  export const BRANDING: import('./utils/configBuilder').BrandingConfig;
  export const SITE: import('./utils/configBuilder').SiteConfig;
  export const I18N: import('./utils/configBuilder').I18NConfig;
  export const METADATA: import('./utils/configBuilder').MetaDataConfig;
  export const APP_BLOG: import('./utils/configBuilder').AppBlogConfig;
  export const APP_PROJECTS: import('./utils/configBuilder').AppProjectsConfig;
  export const TEMPLATE: import('./utils/configBuilder').TemplateConfig;
}
