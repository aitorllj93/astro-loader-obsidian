import {
  createMarkdownProcessor,
  type MarkdownHeading,
} from "@astrojs/markdown-remark";
import { pathToFileURL } from "node:url";
import type { AstroConfig } from "node_modules/astro/dist/types/public/config";

export interface RenderedContent {
  /** Rendered HTML string. If present then `render(entry)` will return a component that renders this HTML. */
  html: string;
  metadata?: {
    /** Any images that are present in this entry. Relative to the {@link DataEntry} filePath. */
    imagePaths?: Array<string>;
    /** Any headings that are present in this file. */
    headings?: MarkdownHeading[];
    /** Raw frontmatter, parsed parsed from the file. This may include data from remark plugins. */
    frontmatter?: Record<string, any>;
    /** Any other metadata that is present in this file. */
    [key: string]: unknown;
  };
}

export interface DataEntry<
  TData extends Record<string, unknown> = Record<string, unknown>
> {
  /** The ID of the entry. Unique per collection. */
  id: string;
  /** The parsed entry data */
  data: TData;
  /** The file path of the content, if applicable. Relative to the site root. */
  filePath?: string;
  /** The raw body of the content, if applicable. */
  body?: string;
  /** An optional content digest, to check if the content has changed. */
  digest?: number | string;
  /** The rendered content of the entry, if applicable. */
  rendered?: RenderedContent;
  /**
   * If an entry is a deferred, its rendering phase is delegated to a virtual module during the runtime phase when calling `renderEntry`.
   */
  deferredRender?: boolean;
  assetImports?: Array<string>;
}

export const getRenderFunction = async (config: AstroConfig) => {
  const processor = await createMarkdownProcessor(config.markdown);
  return async function renderToString(entry: DataEntry) {
    if (!entry.body) {
      return {
        html: "",
      };
    }
    const result = await processor.render(entry.body, {
      frontmatter: entry.data,
      // @ts-expect-error Internal API
      fileURL: entry.filePath ? pathToFileURL(entry.filePath) : undefined,
    });
    return {
      html: result.code,
      metadata: {
        ...result.metadata,
        localImagePaths: Array.from(result.metadata.localImagePaths),
        remoteImagePaths: Array.from(result.metadata.remoteImagePaths),
      },
    };
  };
};
