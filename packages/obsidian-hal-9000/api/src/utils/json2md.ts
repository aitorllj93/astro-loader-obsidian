
export type TFrontMatterVal = string | number | Array<string|number> | Record<string, string|number>

export type TFrontMatter = Record<string, TFrontMatterVal>;

export type TFrontMatterMarkdown = {
  frontmatter: Array<TFrontMatter>,
  body: string
};

function newLineAndIndent(markdownString: string, depth: number) {
  if (depth === 0) {
    return `${markdownString}\n`;
  }

  return `${markdownString}\n${''.padStart(depth*2)}`;
}

function transformMarkdownKeyValueToString(
  key: string,
  value: unknown,
  markdownString: string,
  depth = 0
): string {
	const keyHasInvalidChars = key.includes('@') || key.includes('$');
	const keyStr = keyHasInvalidChars ? `"${key}"` : key;
  try {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        const arrayString = `${value.map(item => `"${item}"`)}`;
        return `${newLineAndIndent(
          markdownString,
          depth
        )}${keyStr}: [${arrayString}]`;
      }
			if (value instanceof Error) {
        return markdownString;
      }
			return Object.entries(value).reduce(
				(accString, [entryKey, entryValue]) => {
					return `${transformMarkdownKeyValueToString(
						entryKey,
						entryValue,
						accString,
						depth + 1
					)}`;
				},
				`${newLineAndIndent(markdownString, depth)}${keyStr}:`
			);
    }
		if (typeof value === 'number') {
      return `${newLineAndIndent(markdownString, depth)}${keyStr}: ${value}`;
    }
		return `${newLineAndIndent(markdownString, depth)}${keyStr}: "${value}"`;
  } catch (err) {
    return `${newLineAndIndent(markdownString, depth)}${keyStr}: ${JSON.stringify(
      value
    )}`;
  }
}

export default function transformToMarkdownString(frontmatterMarkdown: TFrontMatterMarkdown) {
  let markdownString = "---";
	for (const field of frontmatterMarkdown.frontmatter) {
		for (const [key, value] of Object.entries(field)) {
      markdownString = transformMarkdownKeyValueToString(
        key,
        value,
        markdownString
      );
		}
	}

  markdownString = `${markdownString}\n---`;
  try {
    markdownString = `${markdownString}\n${frontmatterMarkdown.body}`;
  } catch (e) {
    markdownString = `${markdownString}\n${JSON.stringify(
      frontmatterMarkdown.body
    )}`;
  }

  return markdownString;
}
