import 'varlock/auto-load';

import { join } from "node:path";
import { readFile } from 'node:fs/promises';
import { ENV } from 'varlock/env';

import type { LegacySpaceshipConfig, SpaceshipConfig } from "../../types";
import { ConfigSchema } from '../../schemas';
import { 
  DEFAULT_ARTICLE_AUTHOR_ENABLED, 
  DEFAULT_ARTICLE_DATE_ENABLED, 
  DEFAULT_LOCALE, 
  DEFAULT_RIGHT_SIDEBAR_BACKLINKS_ENABLED,
  DEFAULT_RIGHT_SIDEBAR_GRAPH_ENABLED, 
  DEFAULT_RIGHT_SIDEBAR_LINKS_ENABLED, 
  DEFAULT_RIGHT_SIDEBAR_MAP_ENABLED, 
  DEFAULT_RIGHT_SIDEBAR_MODE, 
  DEFAULT_RIGHT_SIDEBAR_TOC_ENABLED, 
  DEFAULT_VAULT_DIR
} from '../../constants';

export const isLegacyConfig = (config: SpaceshipConfig): config is LegacySpaceshipConfig => {
  return 'displayOptions' in config;
}

const fromJSONFile = async (): Promise<SpaceshipConfig | null> => {
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
  defaultLocale: ENV.SPACESHIP_DEFAULT_LOCALE ?? DEFAULT_LOCALE,
  title: ENV.SPACESHIP_TITLE,
  description: ENV.SPACESHIP_DESCRIPTION,
  logo: ENV.SPACESHIP_LOGO,
  vaultDir: ENV.OBSIDIAN_VAULT_DIR ?? DEFAULT_VAULT_DIR,
  features: {
    article: {
      author: {
        enabled: ENV.SPACESHIP_FEATURES_ARTICLE_AUTHOR_ENABLED ?? DEFAULT_ARTICLE_AUTHOR_ENABLED,
      },
      publishDate: {
        enabled: ENV.SPACESHIP_FEATURES_ARTICLE_DATE_ENABLED ?? DEFAULT_ARTICLE_DATE_ENABLED,
      }
    },
    rightSidebar: {
      mode: ENV.SPACESHIP_FEATURES_RIGHT_MODE ?? DEFAULT_RIGHT_SIDEBAR_MODE,
      backlinks: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_BACKLINKS_ENABLED ?? DEFAULT_RIGHT_SIDEBAR_BACKLINKS_ENABLED,
      },
      graph: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_GRAPH_ENABLED ?? DEFAULT_RIGHT_SIDEBAR_GRAPH_ENABLED,
      },
      links: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_LINKS_ENABLED ?? DEFAULT_RIGHT_SIDEBAR_LINKS_ENABLED,
      },
      map: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_MAP_ENABLED ?? DEFAULT_RIGHT_SIDEBAR_MAP_ENABLED,
      },
      toc: {
        enabled: ENV.SPACESHIP_FEATURES_RIGHT_TOC_ENABLED ?? DEFAULT_RIGHT_SIDEBAR_TOC_ENABLED,
      },
    }
  }
})

const json = await fromJSONFile();
const env = fromEnv();
const configInput: SpaceshipConfig = json ? { ...env, ...json } : env;

const cache: SpaceshipConfig = isLegacyConfig(configInput) ? configInput : ConfigSchema.parse(configInput);

export default cache;