import fs from 'node:fs';
import os from 'node:os';
import type { AstroConfig, AstroIntegration } from 'astro';

import configBuilder, { type BrandingConfig, type Config, type GlobalContent } from './utils/configBuilder';
import loadConfig from './utils/loadConfig';
import loadGlobalContent from './utils/loadGlobalContent';

export default ({
  config: _themeConfig = 'src/config.yaml',
  globalContent: _globalContentDir = 'src/data/global-content',
}: { config?: string | object; globalContent?: string } = {}): AstroIntegration => {
  let cfg: AstroConfig;
  return {
    name: 'astrowind-integration',

    hooks: {
      'astro:config:setup': async ({
        // command,
        config,
        // injectRoute,
        // isRestart,
        logger,
        updateConfig,
        addWatchFile,
      }) => {
        const buildLogger = logger.fork('astrowind');

        const virtualModuleId = 'astrowind:config';
        const resolvedVirtualModuleId = '\0' + virtualModuleId;

        const rawJsonConfig = (await loadConfig(_themeConfig)) as Config;
        // Every YAML file in the global-content folder becomes GLOBAL_CONTENT.<camelCasedName>.
        // branding.yaml also feeds configBuilder's defaults; a missing file falls back to built-ins.
        const { data: rawGlobalContent, files: globalContentFiles } = await loadGlobalContent(_globalContentDir);
        const { BRANDING, SITE, I18N, METADATA, APP_BLOG, APP_PROJECTS, TEMPLATE } = configBuilder(
          rawJsonConfig,
          (rawGlobalContent.branding ?? {}) as Partial<BrandingConfig>
        );
        // Asserted, not checked: fields added to GlobalContent describe YAML files the compiler can't see.
        const GLOBAL_CONTENT = { ...rawGlobalContent, branding: BRANDING } as GlobalContent;

        updateConfig({
          site: SITE.site,
          base: SITE.base,

          trailingSlash: SITE.trailingSlash ? 'always' : 'never',

          vite: {
            plugins: [
              {
                name: 'vite-plugin-astrowind-config',
                resolveId(id) {
                  if (id === virtualModuleId) {
                    return resolvedVirtualModuleId;
                  }
                },
                load(id) {
                  if (id === resolvedVirtualModuleId) {
                    return `
                    export const GLOBAL_CONTENT = ${JSON.stringify(GLOBAL_CONTENT)};
                    export const BRANDING = GLOBAL_CONTENT.branding;
                    export const SITE = ${JSON.stringify(SITE)};
                    export const I18N = ${JSON.stringify(I18N)};
                    export const METADATA = ${JSON.stringify(METADATA)};
                    export const APP_BLOG = ${JSON.stringify(APP_BLOG)};
                    export const APP_PROJECTS = ${JSON.stringify(APP_PROJECTS)};
                    export const TEMPLATE = ${JSON.stringify(TEMPLATE)};
                    `;
                  }
                },
              },
            ],
          },
        });

        if (typeof _themeConfig === 'string') {
          addWatchFile(new URL(_themeConfig, config.root));
          // Edits to existing files reload; a newly added file needs a dev-server restart.
          for (const file of globalContentFiles) addWatchFile(new URL(file, config.root));

          buildLogger.info(`Astrowind \`${_themeConfig}\` has been loaded.`);
        } else {
          buildLogger.info(`Astrowind config has been loaded.`);
        }
      },
      'astro:config:done': async ({ config }) => {
        cfg = config;
      },

      'astro:build:done': async ({ logger }) => {
        const buildLogger = logger.fork('astrowind');
        buildLogger.info('Updating `robots.txt` with `sitemap-index.xml` ...');

        try {
          const outDir = cfg.outDir;
          const publicDir = cfg.publicDir;
          const sitemapName = 'sitemap-index.xml';
          const sitemapFile = new URL(sitemapName, outDir);
          const robotsTxtFile = new URL('robots.txt', publicDir);
          const robotsTxtFileInOut = new URL('robots.txt', outDir);

          const hasIntegration =
            Array.isArray(cfg?.integrations) &&
            cfg.integrations?.find((e) => e?.name === '@astrojs/sitemap') !== undefined;
          const sitemapExists = fs.existsSync(sitemapFile);

          if (hasIntegration && sitemapExists) {
            const robotsTxt = fs.readFileSync(robotsTxtFile, { encoding: 'utf8', flag: 'a+' });
            const sitemapUrl = new URL(sitemapName, String(new URL(cfg.base, cfg.site)));
            const pattern = /^Sitemap:(.*)$/m;

            if (!pattern.test(robotsTxt)) {
              fs.writeFileSync(robotsTxtFileInOut, `${robotsTxt}${os.EOL}${os.EOL}Sitemap: ${sitemapUrl}`, {
                encoding: 'utf8',
                flag: 'w',
              });
            } else {
              fs.writeFileSync(robotsTxtFileInOut, robotsTxt.replace(pattern, `Sitemap: ${sitemapUrl}`), {
                encoding: 'utf8',
                flag: 'w',
              });
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          /* empty */
        }
      },
    },
  };
};
