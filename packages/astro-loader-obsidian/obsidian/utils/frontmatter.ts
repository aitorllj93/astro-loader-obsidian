import matter from "gray-matter";
import { isYAMLException, MarkdownError, type ErrorLocation } from "../../astro";


export function safeParseFrontmatter(source: string, id?: string) {
  try {
    return matter(source);
  } catch (err) {
    const markdownError = new MarkdownError({
      name: "MarkdownError",
      message: (err as Error).message,
      stack: (err as Error).stack ?? '',
      location: (id
        ? {
            file: id,
          }
        : undefined) as ErrorLocation,
    });

    if (isYAMLException(err)) {
      markdownError.setLocation({
        file: id,
        line: err.mark.line,
        column: err.mark.column,
      } as ErrorLocation);

      markdownError.setMessage(err.reason);
    }

    throw markdownError;
  }
}

export type FrontmatterOutput = ReturnType<typeof safeParseFrontmatter>;
export type FrontmatterData = FrontmatterOutput['data'];