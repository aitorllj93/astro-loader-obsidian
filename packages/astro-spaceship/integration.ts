import type { AstroIntegration } from 'astro';

import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import type { SpaceshipConfig } from './types';

import markdown, { type MarkdownConfig } from "./shell/markdown";

import expressiveCodeDark from './shell/expressive-code/dark';
import expressiveCodeLight from './shell/expressive-code/light';

const INTEGRATION_NAME = 'astro-spaceship';

export function astroSpaceship(
  spaceship: SpaceshipConfig
): AstroIntegration {
  return {
    name: INTEGRATION_NAME,
    hooks: {
      'astro:config:setup': ({ updateConfig, config, }) => {
        updateConfig({
          ...config,
          ...(spaceship.site ? { site: spaceship.site } : {}),
          ...(spaceship.base ? { base: spaceship.base } : {}),
          build: {
            ...config.build,
            format: 'file',
          },
          i18n: {
            ...config.i18n,
            defaultLocale: spaceship.defaultLocale,
            locales: spaceship.locales ?? [spaceship.defaultLocale],
            routing: {
              fallbackType: 'redirect',
              prefixDefaultLocale: false,
              redirectToDefaultLocale: true,
            }
          },
          markdown: markdown(
            spaceship, 
            config.markdown as MarkdownConfig
          ),
          integrations: [
            ...config.integrations.filter(i => i.name !== INTEGRATION_NAME),
            pagefind(),
            sitemap(),
            expressiveCode({
              themes: [expressiveCodeLight, expressiveCodeDark],
            })
          ],
          vite: {
            ...config.vite,
            plugins: [
              ...config.vite.plugins ?? [], 
              tailwindcss()
            ],
          },
        })
      },
    },
  }
}