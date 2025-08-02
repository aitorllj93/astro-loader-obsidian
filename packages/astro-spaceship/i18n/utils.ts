import type { AstroGlobal } from 'astro';
import { defaultLang, ui } from './ui';

export type TranslateFn = (key: keyof (typeof ui)[keyof typeof ui], variables?: Record<string, string>) => string;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key, variables?): string {
    let text: string = ui[lang][key] || ui[defaultLang as keyof typeof ui][key];

    if (!text) {
      console.warn(`Missing translation for key: ${key} in language: ${lang}`);
      return '';
    }

    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        text = text?.replaceAll(`{${key}}`, value)
      }
    }

    return text;
  } satisfies TranslateFn
}

export function useI18n(astro: AstroGlobal) {
  return {
    t: useTranslations(astro.currentLocale as keyof typeof ui ?? defaultLang),
  }
}