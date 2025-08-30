import 'varlock/auto-load';

import { join } from "node:path";
import { readFile } from 'node:fs/promises';
import { ENV } from 'varlock/env';

import type { LegacySpaceshipConfig, SpaceshipConfig } from "../../types";
import { ConfigSchema } from '../../schemas';

export const isLegacyConfig = (config: SpaceshipConfig): config is LegacySpaceshipConfig => {
  return 'displayOptions' in config;
}

const fromJSONFile = async (): Promise<SpaceshipConfig|null> => {
  try {
    const path = join(process.cwd(), 'website.config.json');
    const content = await readFile(path, 'utf-8');
    const json = JSON.parse(content);

    return json;
  } catch {
    return null;
  }
}


const fromEnv = (): SpaceshipConfig => ({
  author: ENV.SPACESHIP_AUTHOR,
  base: ENV.SPACESHIP_BASE,
  site: ENV.SPACESHIP_SITE,
  defaultLocale: ENV.SPACESHIP_DEFAULT_LOCALE ?? 'en',
  title: ENV.SPACESHIP_TITLE,
  description: ENV.SPACESHIP_DESCRIPTION,
  logo: ENV.SPACESHIP_LOGO,
  features: {
    article: {
      author: {
        enabled: ENV.SPACESHIP_FEATURES_ARTICLE_AUTHOR_ENABLED ?? false,
      },
      publishDate: {
        enabled: ENV.SPACESHIP_FEATURES_ARTICLE_DATE_ENABLED ?? false,
      }
    },
    rightSidebar: {
      mode: ENV.SPACESHIP_FEATURES_RIGHT_MODE ?? 'tabset',
      backlinks: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_BACKLINKS_ENABLED ?? false,
      },
      graph: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_GRAPH_ENABLED ?? false,
      },
      links: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_LINKS_ENABLED ?? false,
      },
      map: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_MAP_ENABLED ?? false,
      },
      toc: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_TOC_ENABLED ?? false,
      },
    }
  }
})

const json = await fromJSONFile();
const env = fromEnv();
const configInput: SpaceshipConfig = json ? { ...env, ...json } : env;

const cache: SpaceshipConfig = isLegacyConfig(configInput) ? configInput : ConfigSchema.parse(configInput);

export default cache;