import { join } from "node:path";
import { readFile } from 'node:fs/promises';

import type { LegacySpaceshipConfig, SpaceshipConfig } from "../../types";
import { ConfigSchema } from '../../schemas';

const content = await readFile(join(process.cwd(), 'website.config.json'), 'utf-8');


let cache: SpaceshipConfig = ConfigSchema.parse(JSON.parse(content));

export const isLegacyConfig = (config: SpaceshipConfig): config is LegacySpaceshipConfig => {
  return 'displayOptions' in config;
}

export const getConfig = async (): Promise<SpaceshipConfig> => {
  if (cache) {
    return cache;
  }

  const content = await readFile(join(process.cwd(), 'website.config.json'), 'utf-8');

  cache = ConfigSchema.parse(JSON.parse(content));

  return cache;
}

export default cache;