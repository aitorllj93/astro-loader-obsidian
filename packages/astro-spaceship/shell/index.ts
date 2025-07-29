import type { AstroUserConfig } from "astro";

import pagefind from "astro-pagefind";
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import type { SpaceshipConfig } from '../types';

import markdown from "./markdown";

export const create = (
  websiteConfig: SpaceshipConfig,
  overrides?: AstroUserConfig
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
  markdown,
  integrations: [
    pagefind(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  ...overrides,
});

create({
  defaultLocale: 'en',
  title: 'asassa'
}, {})