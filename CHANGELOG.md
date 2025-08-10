
# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/). For a style guide, please read [Common Changelog](https://common-changelog.org/).
 
## [Unreleased] - yyyy-mm-dd
 
## 0.7.0 - 2025-08-10

### Added
- `astro-spaceship`: Now project config must be loaded as an Astro Integration ([#19](https://github.com/aitorllj93/astro-loader-obsidian/issues/19))
  ```ts
    import { astroSpaceship } from 'astro-spaceship';

    export default defineConfig({
      integrations: [
        astroSpaceship(websiteConfig)
      ]
    });
    ```
- `astro-spaceship`: MathJax support
- `astro-spaceship`: Comments support
- `astro-spaceship`: Mermaid Diagrams support
- `astro-loader-obsidian`: Audio, Video and PDF file embeds support
- `astro-spaceship`: Right Sidebar Column Layout
- `spaceship-monolith`: Add new themes: Journey and Temple

 
### Changed

- `astro-spaceship`: Improve Customization of the Article component
- `spaceship-monolith`: Styling Enhancements
 
### Fixed

- `astro-spaceship`: Fix favicon link path in Layout component
- `astro-loader-obsidian`: Embed heading now supports recursive search