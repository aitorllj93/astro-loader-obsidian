
import { defineConfig } from 'astro/config';
import { astroSpaceship } from 'astro-spaceship';

import websiteConfig from './website.config.json';

export default defineConfig({
  integrations: [
    astroSpaceship(websiteConfig)
  ]
});