import merge from 'lodash.merge';

import type { MetaData } from '~/types';

export type Config = {
  site?: SiteConfig;
  metadata?: MetaDataConfig;
  i18n?: I18NConfig;
  apps?: {
    blog?: AppBlogConfig;
    projects?: AppProjectsConfig;
  };
  analytics?: unknown;
  template?: TemplateConfigInput;
};

export interface SiteConfig {
  name: string;
  site?: string;
  base?: string;
  trailingSlash?: boolean;
  googleSiteVerificationId?: string;
}
export interface MetaDataConfig extends Omit<MetaData, 'title'> {
  title?: {
    default: string;
    template: string;
  };
}
export interface I18NConfig {
  language: string;
  textDirection: string;
  dateFormatter?: Intl.DateTimeFormat;
}
export interface AppBlogConfig {
  isEnabled: boolean;
  postsPerPage: number;
  isRelatedPostsEnabled: boolean;
  relatedPostsCount: number;
  post: {
    isEnabled: boolean;
    permalink: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  list: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  category: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  tag: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
}
/** Same shape as AppBlogConfig, applied to the `project` collection instead of `post`. */
export interface AppProjectsConfig {
  isEnabled: boolean;
  projectsPerPage: number;
  isRelatedProjectsEnabled: boolean;
  project: {
    isEnabled: boolean;
    permalink: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  list: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  category: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  tag: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
}

export interface AnalyticsConfig {
  vendors: {
    googleAnalytics: {
      id?: string;
      partytown?: boolean;
    };
  };
}

// ---------------------------------------------------------------------------
// Template config (persona, theme default, effects, shell, integrations)
// ---------------------------------------------------------------------------

export interface TemplateIdentity {
  name: string;
  handle: string;
  org: string;
  role: string;
  tagline: string;
  location: string;
}

export interface TemplateSocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface TemplateThemesConfig {
  default: string;
}

export interface TemplateEffectsConfig {
  boot: boolean;
  noise: boolean;
  scanline: boolean;
  overlay: boolean;
  decoder: boolean;
}

export interface TemplateShellConfig {
  prompt: string;
  motd: string;
}

export interface TemplateFormsIntegration {
  provider: string;
  accessKey: string | null;
}

export interface TemplateAnalyticsIntegration {
  id: string | null;
}

export interface TemplateIntegrations {
  forms: TemplateFormsIntegration;
  gtm: TemplateAnalyticsIntegration;
  ga: TemplateAnalyticsIntegration;
}

export interface TemplateConfig {
  identity: TemplateIdentity;
  social: TemplateSocialLink[];
  themes: TemplateThemesConfig;
  effects: TemplateEffectsConfig;
  shell: TemplateShellConfig;
  integrations: TemplateIntegrations;
}

/** Everything under `template:` in config.yaml is optional; configBuilder fills in the defaults below. */
export type TemplateConfigInput = {
  identity?: Partial<TemplateIdentity>;
  social?: TemplateSocialLink[];
  themes?: Partial<TemplateThemesConfig>;
  effects?: Partial<TemplateEffectsConfig>;
  shell?: Partial<TemplateShellConfig>;
  integrations?: {
    forms?: Partial<TemplateFormsIntegration>;
    gtm?: Partial<TemplateAnalyticsIntegration>;
    ga?: Partial<TemplateAnalyticsIntegration>;
  };
};

const DEFAULT_SITE_NAME = 'Website';

const getSite = (config: Config) => {
  const _default = {
    name: DEFAULT_SITE_NAME,
    site: undefined,
    base: '/',
    trailingSlash: false,

    googleSiteVerificationId: '',
  };

  return merge({}, _default, config?.site ?? {}) as SiteConfig;
};

const getMetadata = (config: Config) => {
  const siteConfig = getSite(config);

  const _default = {
    title: {
      default: siteConfig?.name || DEFAULT_SITE_NAME,
      template: '%s',
    },
    description: '',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: 'website',
    },
  };

  return merge({}, _default, config?.metadata ?? {}) as MetaDataConfig;
};

const getI18N = (config: Config) => {
  const _default = {
    language: 'en',
    textDirection: 'ltr',
  };

  const value = merge({}, _default, config?.i18n ?? {});

  return value as I18NConfig;
};

const getAppBlog = (config: Config) => {
  const _default = {
    isEnabled: false,
    postsPerPage: 6,
    isRelatedPostsEnabled: false,
    relatedPostsCount: 4,
    post: {
      isEnabled: true,
      permalink: '/blog/%slug%',
      robots: {
        index: true,
        follow: true,
      },
    },
    list: {
      isEnabled: true,
      pathname: 'blog',
      robots: {
        index: true,
        follow: true,
      },
    },
    category: {
      isEnabled: true,
      pathname: 'category',
      robots: {
        index: true,
        follow: true,
      },
    },
    tag: {
      isEnabled: true,
      pathname: 'tag',
      robots: {
        index: false,
        follow: true,
      },
    },
  };

  return merge({}, _default, config?.apps?.blog ?? {}) as AppBlogConfig;
};

const getAppProjects = (config: Config) => {
  const _default = {
    isEnabled: true,
    projectsPerPage: 12,
    isRelatedProjectsEnabled: false,
    project: {
      isEnabled: true,
      permalink: '/projects/%slug%',
      robots: {
        index: true,
        follow: true,
      },
    },
    list: {
      isEnabled: true,
      pathname: 'projects',
      robots: {
        index: true,
        follow: true,
      },
    },
    category: {
      isEnabled: true,
      pathname: 'category',
      robots: {
        index: true,
        follow: true,
      },
    },
    tag: {
      isEnabled: false,
      pathname: 'tag',
      robots: {
        index: false,
        follow: true,
      },
    },
  };

  return merge({}, _default, config?.apps?.projects ?? {}) as AppProjectsConfig;
};

const getAnalytics = (config: Config) => {
  const _default = {
    vendors: {
      googleAnalytics: {
        id: undefined,
        partytown: true,
      },
    },
  };

  return merge({}, _default, config?.analytics ?? {}) as AnalyticsConfig;
};

const getTemplate = (config: Config) => {
  const _default: TemplateConfig = {
    identity: {
      name: 'Ada Operator',
      handle: 'ada',
      org: 'MAINFRAME-7 Systems',
      role: 'Systems Developer',
      tagline: 'Building steady systems, one terminal command at a time.',
      location: 'Sector 7, Grid North',
    },
    social: [
      { label: 'GitHub', href: 'https://github.com/example', icon: 'tabler:brand-github' },
      { label: 'X', href: 'https://x.com/example', icon: 'tabler:brand-x' },
      { label: 'RSS', href: '/rss.xml', icon: 'tabler:rss' },
    ],
    themes: {
      default: 'green',
    },
    effects: {
      boot: true,
      noise: true,
      scanline: true,
      overlay: true,
      decoder: true,
    },
    shell: {
      prompt: 'guest@mainframe-7:~$',
      motd: 'Type help to list commands.',
    },
    integrations: {
      forms: { provider: 'web3forms', accessKey: null },
      gtm: { id: null },
      ga: { id: null },
    },
  };

  return merge({}, _default, config?.template ?? {}) as TemplateConfig;
};

export default (config: Config) => ({
  SITE: getSite(config),
  I18N: getI18N(config),
  METADATA: getMetadata(config),
  APP_BLOG: getAppBlog(config),
  APP_PROJECTS: getAppProjects(config),
  ANALYTICS: getAnalytics(config),
  TEMPLATE: getTemplate(config),
});
