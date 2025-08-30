
# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/). For a style guide, please read [Common Changelog](https://common-changelog.org/).
 
## [Unreleased] - yyyy-mm-dd

## 0.9.0 - 2025-08-30

### Added

- `astro-spaceship`: Config load from env vars with varlock

## 0.8.0 - 2025-08-20

### Added
- `astro-spaceship`: New internal API routes for graph data: `/_spaceship/graph/`
- `astro-spaceship`: Initial mapview support (only for `linkedfrom` queries). Plugin link: [plugin](https://github.com/esm7/obsidian-map-view)
- - Map can be displayed in the following contexts:
- - - Global map with data from all notes
- - - Map in the right sidebar of notes with location property
- - - Map embedded with linkedfrom configuration
- `astro-spaceship`: Website.config loading with schema validation
- `astro-spaceship`: Text Reader component for text2speech reading
- `spaceship-monolith`: Grid Layout
- `spaceship-monolith`: Improve Journey Theme

### Changed

- `astro-spaceship`: Deprecate website config `displayOptions` in favor of `features`.
 
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