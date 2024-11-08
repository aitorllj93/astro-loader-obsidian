import { slug as githubSlug } from 'github-slugger';
import path from 'node:path';

export function slugify(str: string) {
  const withoutFileExt = str.replace(new RegExp(path.extname(str) + '$'), '');
  const rawSlugSegments = withoutFileExt.split(path.sep);

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(segment))
    .join('/')
    .replace(/\/index$/, '');

  return slug;
}
