import { join } from "node:path";
import { readFile } from 'node:fs/promises';

import type { LegacySpaceshipConfig, SpaceshipConfig } from "../../types";
import { ConfigSchema } from '../../schemas';

export const isLegacyConfig = (config: SpaceshipConfig): config is LegacySpaceshipConfig => {
  return 'displayOptions' in config;
}

const path = join(process.cwd(), 'website.config.json');
const content = await readFile(path, 'utf-8');
const json = JSON.parse(content);

let cache: SpaceshipConfig = isLegacyConfig(json) ? json : ConfigSchema.parse(json);

export const getConfig = async (): Promise<SpaceshipConfig> => {
  if (cache) {
    return cache;
  }


  const content = await readFile(path, 'utf-8');
  const json = JSON.parse(content);
  cache = isLegacyConfig(json) ? json : ConfigSchema.parse(json);

  return cache;
}

export default cache;