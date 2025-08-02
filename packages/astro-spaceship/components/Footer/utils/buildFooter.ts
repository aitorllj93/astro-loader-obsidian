import { convert as htmlToText } from "html-to-text";
import calculateReadingTime from "reading-time";

import type { Document, FooterData } from "../../../types";
import  { type TranslateFn, useI18n } from "../../../i18n";
import type { AstroGlobal } from 'astro';

const formatDuration =
  (t: TranslateFn) =>
  (ms: number): string => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000
  };
  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => {
      const tkey = `${key}${val !== 1 ? 's' : ''}`;

      return t(`format.${tkey}` as 'format.minutes', { [tkey]: val.toString() })
    })[0] as string
    // .join(', ');
};

export const buildFooter = (astro: AstroGlobal, document?: Document): FooterData|null => {
  if (!document?.rendered) {
    return null;
  }

  const { t } = useI18n(astro);
  const text = htmlToText(document?.rendered?.html as string);
  const readingTime = formatDuration(t)(calculateReadingTime(text).time);
  const words = text.split(" ").filter(t => t.length > 0).length.toString();
  const characters = text.length.toString();
  
  return {
    readingTime: t("footer.readingTime", { readingTime }),
    words,
    characters,
  }
}