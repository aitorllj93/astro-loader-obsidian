---
order: 1
---

There's a special json file in the root of your Astro project that defines how your website is configured. This file is called `website.config.json` and it contains various settings that control the behavior and appearance of your site. This file can be imported in your Astro components with the alias `@/config`.

## Properties

### `author`

This field specifies the default author for your content. It can be overridden in individual content files. Author data can be configured in the `src/content/authors` directory.

### `base`

Same as [Astro's](https://docs.astro.build/en/reference/configuration-reference/) `base` config option, this field specifies the base path to depoy to. Astro will use this path as the root for your pages and assets both in development and in production build.

### `defaultLocale`

This field specifies the default locale for your site. It is used when no specific locale is set for a page or content item. This is useful for internationalization (i18n) support.

### `description`

This field provides a default description for your site. It is used in the `<meta>` tags for SEO purposes and can be overridden in individual pages or content files.

### `site`

Same as [Astro's](https://docs.astro.build/en/reference/configuration-reference/) `base` config option, this field specifies the default site URL for your site. It is used when generating absolute URLs for links and can be overridden in individual pages or content files.

### `title`

This field specifies the default title for your site. It is used in the `<title>` tag and can be overridden in individual pages or content files.

## Command Line Interface

You can interact with the `website.config.json` file through the command line using the `spaceship config` command. This allows you to view and modify the configuration without directly editing the JSON file.

First you must install the Spaceship CLI globally:

```sh
npm install -g create-spaceship
```

Then you can use the following commands:

### Get a configuration value

```sh
spaceship config get <key>
```

### Set a configuration value

```sh
spaceship config set <key> <value>
```