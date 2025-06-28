import { slash } from '@astrojs/internal-helpers/path';
import { slug as githubSlug } from 'github-slugger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isWindows =
  typeof process !== 'undefined' && process.platform === 'win32';

interface GenerateIdOptions {
  /** The path to the entry file, relative to the base directory. */
  entry: string;

  /** The base directory URL. */
  base: URL;
  /** The parsed, unvalidated data of the entry. */
  data: Record<string, unknown>;
}

type ContentPaths = {
  contentDir: URL;
  assetsDir: URL;
  typesTemplate: URL;
  virtualModTemplate: URL;
  config: {
    exists: boolean;
    url: URL;
  };
};

function getRelativeEntryPath(entry: URL, collection: string, contentDir: URL) {
  const relativeToContent = path.relative(
    fileURLToPath(contentDir),
    fileURLToPath(entry)
  );
  const relativeToCollection = path.relative(collection, relativeToContent);
  return relativeToCollection;
}

function normalizePath(id: string) {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

export function slugify(str: string) {
  const withoutFileExt = str.replace(new RegExp(`${path.extname(str)}$`), '');
  const rawSlugSegments = withoutFileExt.split(path.sep);

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(segment))
    .join('/')
    .replace(/\/index$/, '');

  return slug;
}

function getContentEntryIdAndSlug({
  entry,
  contentDir,
  collection,
}: Pick<ContentPaths, 'contentDir'> & { entry: URL; collection: string }): {
  id: string;
  slug: string;
} {
  const relativePath = getRelativeEntryPath(entry, collection, contentDir);

  const res = {
    id: normalizePath(relativePath),
    slug: slugify(relativePath),
  };
  return res;
}

export function generateId({ entry, base, data }: GenerateIdOptions): string {
  if (data.slug) {
    return data.slug as string;
  }
  const entryURL = new URL(encodeURI(entry), base);
  const { slug } = getContentEntryIdAndSlug({
    entry: entryURL,
    contentDir: base,
    collection: '',
  });
  return slug;
}
