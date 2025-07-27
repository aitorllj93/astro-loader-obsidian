
import path from 'node:path';

const ZETTELKASTEN_TIMESTAMP_ID_PATTERN = /^(\d{12})(?:\s+)?(.+)?$/;
const ZETTELKASTEN_DATE_ID_PATTERN = /^(\d{8})(?:\s+)?(.+)?$/;
const ZETTELKASTEN_NIKLAS_LUHMANN_PATTERN = /^(?<zettelId>\d+[a-zA-Z]*(?:\d+[a-zA-Z]*)*)\s*(?<title>.*)?$/;

import type { FrontmatterData } from "../utils/frontmatter";
import type { ObsidianContext } from "../../types";
import type { Zettelkasten } from '../../schemas';

const zettelIdToDate = (id: string): Date | null => {
  const match = id.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);
  return new Date(year ?? 0, (month ?? 0) - 1, day, hour, minute);
}

const zettelIdToDateOnly = (id: string): Date | null => {
  const match = id.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  return new Date(year ?? 0, month ?? 0 - 1, day);
}

const zettelIdToBreadcrumbs = (id: string): { id: string; path: string }[] => {
  const breadcrumbs: { id: string; path: string }[] = [];
  let path = "";

  for (const char of id) {
    path += char;
    breadcrumbs.push({ id: char, path });
  }

  return breadcrumbs;
}

type ExtractedFields = Record<string, string> | null;

const extractTemplateFields = (template: string, input: string): ExtractedFields => {
  const fieldPattern = /{{\s*(\w+)\s*}}/g;

  const fieldNames: string[] = [];

  // Build the regex dynamically
  let regexStr = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = fieldPattern.exec(template)) !== null) {
    // Literal part before the field: escape regex characters
    const before = template.slice(lastIndex, match.index).replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    regexStr += before;

    if (!match[1]) {
      continue;
    }

    // Add capture group
    fieldNames.push(match[1]);
    regexStr += '(.*?)';

    lastIndex = match.index + match[0].length;
  }

  // Add remaining literal after last field
  regexStr += template.slice(lastIndex).replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

  const regex = new RegExp(`^${regexStr}$`);
  const result = regex.exec(input);

  if (!result) return null;

  const extracted: Record<string, string> = {};
  fieldNames.forEach((name, i) => {
    extracted[name] = result[i + 1] ?? '';
  });

  return extracted;
}


const getPattern = (context: ObsidianContext) => {
  if (context.options.zettelkasten?.pattern) {
    return new RegExp(context.options.zettelkasten.pattern);
  }

  if (context.options.zettelkasten?.format === 'niklas-luhmann') {
    return ZETTELKASTEN_NIKLAS_LUHMANN_PATTERN;
  }

  if (context.options.zettelkasten?.format === 'date_id') {
    return ZETTELKASTEN_DATE_ID_PATTERN;
  }

  return ZETTELKASTEN_TIMESTAMP_ID_PATTERN;
}

const zettelMeta = (id: string, context: ObsidianContext) => {
  if (context.options.zettelkasten?.format === 'niklas-luhmann') {
    return {
      breadcrumbs: zettelIdToBreadcrumbs(id),
    }
  }

  if (context.options.zettelkasten?.format === 'date_id') {
    return {
      date: zettelIdToDateOnly(id),
    };
  }

  return {
    date: zettelIdToDate(id),
  };
}

type Zettel = NonNullable<Zettelkasten['zettelkasten']>;

export const zettel = (
  entry: string,
  context: ObsidianContext,
  data: FrontmatterData
) => {
  const filename = path.basename(entry, path.extname(entry));;

  const result: {
    zettelId: Zettel['id'] | null,
    zettelIdMeta: Zettel['meta'] | null,
    title: string,
  } = {
    zettelId: null,
    zettelIdMeta: null,
    title: filename,
  };

  const fields = extractTemplateFields(context.options.zettelkasten?.template ?? '{{zettelId}} {{title}}', filename);

  if (!fields?.zettelId) {
    return result;
  }

  if (fields.title) {
    result.title = fields.title;
  }

  const pattern = getPattern(context);

  const match = fields.zettelId.match(pattern);

  if (!match) {
    return result;
  }

  result.zettelId = fields.zettelId;
  result.zettelIdMeta = zettelMeta(result.zettelId, context);

  return result;
};
