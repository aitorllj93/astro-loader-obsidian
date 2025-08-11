import type { SpaceshipConfig } from "../../../types";

import { join } from "node:path";
import { readFile } from 'node:fs/promises';

let cache: SpaceshipConfig|null = null;

export const getConfig = async (): Promise<SpaceshipConfig> => {
  if (cache) {
    return cache;
  }

  const content = await readFile(join(process.cwd(), 'website.config.json'), 'utf-8');

  cache = JSON.parse(content) as SpaceshipConfig;

  return cache;
}