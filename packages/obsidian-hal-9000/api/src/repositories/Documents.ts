import fm from "front-matter";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { readFile } from "node:fs/promises";
import json2md, { type TFrontMatter, type TFrontMatterVal } from "../utils/json2md";
import type { DocumentInput } from "../types";

export class DocumentRepository {
  constructor(private readonly cwd: string) {}

  public async addDocument(
    name: string,
    body = "",
    frontMatter: Record<string, number|string|string[]|undefined> = {}
  ) {

    return this.writeDocument(name, body, frontMatter);
  }

  public async getDocument<T extends DocumentInput>(
    name: string
  ) {
    const doc = await this.readDocument<T>(name);

		if (!doc) {
			return null;
		}

    return {
      name,
      attributes: doc.attributes,
      body: doc.body,
    }
  }

  public async addTag(
    name: string,
    tag: string,
  ) {
    const doc = await this.readDocument(name);

		if (!doc) {
			throw new Error(`Document with name ${name} not found`);
		}

		const {
      attributes,
      body,
      path,
    } = doc;

		attributes.tags = attributes.tags ?? [];

    const alreadyExists = attributes.tags?.includes(tag);

    if (alreadyExists) {
      return;
    }

    attributes.tags?.push(tag);

    await this.writeDocument(name, body, attributes);
    
    return path;
  }

  public async updateThumbnail(
    name: string,
    thumbnail: string
  ) {
    const thumbnailPath = thumbnail.replace(`${this.cwd}/`, '');

    const doc = await this.readDocument<{
      cover: string;
      'cover-x': number;
      'cover-y': number;
    }>(name);

		if (!doc) {
			throw new Error(`Document with name ${name} not found`);
		}

		const {
      attributes,
      body,
      path,
    } = doc;

    attributes.cover = `[[${thumbnailPath}]]`;
    attributes['cover-x'] = 50;
    attributes['cover-y'] = 25;

    await this.writeDocument(name, body, attributes);
    
    return path;
  }

  private async writeDocument(
    name: string,
    body = "",
    frontMatter: Record<string, TFrontMatterVal|undefined> = {}
  ) {
    const path = this.resolvePath(name);

    const frontMatterArray: TFrontMatter[] = Object.entries(frontMatter)
      .filter(
        ([_, v]) => v !== undefined && (!Array.isArray(v) || v.length > 0)
      )
      .map(([k, v]) => ({ [k]: v })) as TFrontMatter[];

    const content = json2md({
      frontmatter: frontMatterArray,
      body,
    });

    await writeFile(path, content);

    return path;
  }

  private async readDocument<T extends DocumentInput>(
    name: string
  ) {
    const path = this.resolvePath(name);

		try {
			const content = await readFile(path, "utf-8");
			const parsed = fm<T>(content);
			return { path, ...parsed };
		} catch (err) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			if ((err as any)?.code === "ENOENT") return null; // archivo no existe
			throw err; // otros errores sí deben propagarse
		}
  }

  private resolvePath(name: string) {
    const entryName = name.endsWith('.md') ? name.slice(0, -3) : name;
    const path = join(this.cwd, `${entryName}.md`);

    return path;
  }
}
