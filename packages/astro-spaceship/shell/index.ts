import type { AstroUserConfig } from "astro";

import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import type { SpaceshipConfig } from '../types';

import markdown from "./markdown";

import expressiveCodeDark from './expressive-code/dark';
import expressiveCodeLight from './expressive-code/light';

/**
 * @deprecated use astroSpaceship integration instead
 */
export const create = (
  websiteConfig: SpaceshipConfig,
  { markdown: markdownConfig, ...overrides }: AstroUserConfig = {}
): AstroUserConfig =>
({
  ...(websiteConfig.site ? { site: websiteConfig.site } : {}),
  ...(websiteConfig.base ? { base: websiteConfig.base } : {}),
  build: {
    format: 'file',
  },
  i18n: {
    defaultLocale: websiteConfig.defaultLocale,
    locales: [websiteConfig.defaultLocale],
  },
  markdown: markdown(websiteConfig, markdownConfig),
  integrations: [
    pagefind(),
    sitemap(),
    expressiveCode(
    {
      themes: [expressiveCodeLight, expressiveCodeDark],
    }
  )
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  ...overrides,
});