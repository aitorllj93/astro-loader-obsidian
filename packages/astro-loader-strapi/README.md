# Astro Loader for Strapi Collections 🪐🔗

## Usage

```ts
import { getSecret } from "astro:env/server"

import { createStrapiLoader } from "astro-loader-strapi";

// Configure the strapi Loader with your strapi credentials and locales
const strapi = createStrapiLoader({
  strapiUrl: getSecret('STRAPI_URL'),
  strapiApiToken: getSecret('STRAPI_API_TOKEN'),
  locales: ['es', 'en'],
  status: import.meta.env.DEV === true ? "draft" : "published",
});

// Define your populates so you can reuse them in multiple collections
const POPULATES = {
  REF: {
    fields: ["documentId"],
  },
  SEO: {
    fields: ["metaDescription", "metaTitle", "metaImage", "keywords"],
  },
  BLOCK: {
    on: {
      "blocks.admonition": {
        fields: ["Kind", "Icon", "Body"],
      },
      "blocks.image": {
        fields: ["Image", "Alt", "Width", "Height"],
      },
      "blocks.paragraph": {
        fields: ["Body", "Title"],
      },
    }
  }
};

// Define your collections
const articles = defineCollection({
  loader: strapi("articles", {
    populate: {
      Taxonomy: POPULATES.REF,
      Page: POPULATES.BLOCK,
      seo: POPULATES.SEO,
    },
  }),
  schema: Article,
})

export const collections = {
  articles,
};

```