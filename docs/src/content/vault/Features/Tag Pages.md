---
order: 40
---

Tag pages provide dedicated landing pages for each tag in your vault, automatically aggregating all documents that use a particular tag. This creates a powerful organizational structure that bridges tagging and traditional navigation.

## Features

- **Automatic tag detection**: Both inline `#tag` references and YAML frontmatter tags are detected
- **Dedicated tag URLs**: Each tag gets its own page at `/about/tags/{tag-name}`
- **Custom tag content**: Create markdown files in `About/Tags/` to add descriptions and context
- **Tagged document lists**: Each tag page automatically displays all documents using that tag
- **Seamless integration**: Tags in document bodies are automatically linked to their tag pages

## How It Works

The loader scans your vault for tags in two locations:
1. **Inline tags**: Hash-prefixed tags like #examples or #section-name in document content
2. **Frontmatter tags**: Tags defined in YAML frontmatter

Each tag automatically gets a dedicated page that:
- Renders custom content if a markdown file exists in `About/Tags/`
- Lists all documents that use the tag
- Provides a central hub for exploring related content

## Creating Custom Tag Pages

To add custom content to a tag page, create a markdown file in your vault:

```
About/Tags/section-name.md
```

Example frontmatter:
```yaml
---
name: Section Name
description: A brief description of this topic area
---

Additional markdown content describing this tag/section...
```

The custom content will appear at the top of the tag page, followed by the list of tagged documents.

## Configuration

Tag pages are configured in your content collections:

```typescript
loader: ObsidianMdLoader({
  base: `${VAULT_DIR}/About/Tags`,
  url: '',
  tagsUrl: 'about/tags',
  pattern: '**/*.md',
})
```

The `tagsUrl` option controls where tag pages are located in your site's URL structure.

## Obsidian Plugin Integration

For better tag management in Obsidian, consider using the **Tag Wrangler** plugin:

```embed
title: "GitHub - pjeby/tag-wrangler: Rename, merge, toggle, and search tags from the Obsidian tag pane"
image: "https://opengraph.githubassets.com/1/pjeby/tag-wrangler"
description: "Rename, merge, toggle, and search tags from the Obsidian tag pane - pjeby/tag-wrangler"
url: "https://github.com/pjeby/tag-wrangler"
aspectRatio: "50"
```

Tag Wrangler provides:
- Batch rename tags across your vault
- Merge duplicate or related tags
- Create tag pages directly from the tag pane
- Search and filter by tags
- Hierarchical tag management

## Example

Try clicking any tag on this page, like #examples or #section-name, to see tag pages in action!
