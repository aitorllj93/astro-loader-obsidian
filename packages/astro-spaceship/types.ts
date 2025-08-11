import type z from "astro/zod";

import type { AuthorSchema, ConfigSchema, DocumentSchema, TagSchema } from "./schemas";

export type LegacySpaceshipConfig = {
  author?: string;
  base?: string;
  defaultLocale: string;
  locales?: string[];
  description?: string;
  site?: string;
  title: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  logo?: any | undefined;
  /** @deprecated use features instead */
  displayOptions?: {
    showAuthor?: boolean;
    showPublishDate?: boolean;
    rightSidebar?: {
      mode?: 'tabset' | 'column' | string;
    }
  };
};

export type SpaceshipConfig = LegacySpaceshipConfig | z.infer<typeof ConfigSchema>;

export type Seo = {
  title?: string | undefined;
  description?: string | undefined;
  canonicalUrl?: string | undefined;
  keywords?: string | undefined;
  image?: string | undefined;
  openGraph?: {
    title?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
    url?: string | undefined;
    siteName?: string | undefined;
  };
  twitter?: {
    title?: string | undefined;
    description?: string | undefined;
    image?: string | undefined;
  };
};

export type Page = {
  language: string;
  title: string;
  seo: Seo;
};

type Heading = {
  depth: number;
  slug: string;
  text: string;
};


type RenderedContent = {
  html: string;
  metadata?: {
    imagePaths: Array<string>;
    headings?: Heading[];
    [key: string]: unknown;
  };
}

type CollectionEntry<TData = unknown> = {
  id: string;
  body?: string;
  collection: string;
  data: TData;
  rendered?: RenderedContent;
  filePath?: string;
}

export type Document = CollectionEntry<z.infer<typeof DocumentSchema>>;
export type Author = CollectionEntry<z.infer<typeof AuthorSchema>>;
export type Tag = CollectionEntry<z.infer<typeof TagSchema>>;

export type Node<T> = {
  name: string;
  permalink: string;
  children?: Node<T>[];
  data?: T;
};

export type TreeData = Node<Document>[];

export type GraphViewNode = {
  id: string;
  href?: string | undefined;
  title?: string | undefined;
  group?: string | undefined;
  radius: number;
};

export type GraphViewLink = {
  source: string;
  target: string;
  value: number;
}

export type GraphViewData = {
  nodes: GraphViewNode[];
  links: GraphViewLink[];
}

export type FooterData = {
  readingTime: string;
  words: string;
  characters: string;
}