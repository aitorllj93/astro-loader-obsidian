---
order: 2
relateds:
  - "[[Obsidian]]"
---

## Pre-configured Content Collections

Spaceship comes with pre-configured Astro content collections to help you manage your Obsidian notes as content. This allows you to use your Obsidian vault as a source of content for your Astro website.

### Documents

The `documents` collection is designed to handle your Obsidian notes. It automatically processes your notes and makes them available as content in Astro. It uses the [[Obsidian Loader]] to read your notes and extract metadata.

### Authors

The `authors` collection is designed to handle author information from your Obsidian notes. It lets you to define extra metadata for authors, such as their name, bio, and social links.

### Tags

The `tags` collection is designed to handle tags from your Obsidian notes. It allows you to define extra metadata for tags, such as their name and description.

## Collection Loaders

[Astro loaders](https://docs.astro.build/en/reference/content-loader-reference/) allow you to load data into content collections, which can then be used in pages and components. The built-in glob() and file() loaders are used to load content from the file system, and you can create your own loaders to load content from other sources.

- [[Obsidian Loader]]: Loads your Obsidian notes as content.