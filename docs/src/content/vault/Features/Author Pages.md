---
order: 41
---

Author pages create dedicated profiles for content authors, showing their information, bio, and all articles they've written. This feature is perfect for multi-author blogs, documentation teams, or personal sites with guest contributors.

## Features

- **Author profiles**: Dedicated pages for each author at `/about/authors/{author-id}`
- **Multiple formats supported**: YAML files (`.yml`) or Markdown files (`.md`)
- **Rich author metadata**: Names, avatars, bios, social links, and custom fields
- **Automatic article lists**: Each author page shows all documents they've authored
- **Flexible attribution**: Link authors to documents via frontmatter

## How It Works

Authors are defined in the `About/Authors/` directory of your vault. The loader automatically:
1. Scans for author files (`.yml` or `.md`)
2. Creates dedicated author pages
3. Links documents to authors via the `author` frontmatter field
4. Generates author profile pages with their published content

## Creating Author Profiles

### YAML Format

Create a file like `About/Authors/john-doe.yml`:

```yaml
name: John Doe
avatar: https://example.com/avatar.jpg
bio: Software developer and technical writer
email: john@example.com
social:
  twitter: johndoe
  github: johndoe
  website: https://johndoe.com
```

### Markdown Format

Create a file like `About/Authors/jane-smith.md`:

```markdown
---
name: Jane Smith
avatar: https://example.com/jane-avatar.jpg
email: jane@example.com
---

Jane is a senior developer with 10 years of experience in web technologies.
She specializes in React, TypeScript, and modern frontend architecture.

## Expertise
- Frontend Development
- TypeScript
- React & Astro
```

## Linking Authors to Documents

In your document frontmatter, reference the author by their file ID:

```yaml
---
title: My Article
author: john-doe
date: 2025-01-15
---

Article content here...
```

The author ID corresponds to the filename (without extension) of the author file.

## Configuration

Author pages are configured in your content collections:

```typescript
loader: ObsidianMdLoader({
  base: `${VAULT_DIR}/About/Authors`,
  url: 'about/authors',
  pattern: '**/*.{md,yml}',
})
```

## Author Page Display

Each author page automatically includes:
- Author name and avatar
- Bio or markdown content
- Social media links
- Contact information
- Complete list of authored documents
- Publication dates and metadata

## Multi-Author Support

The loader supports:
- **Single author**: Default author for all documents
- **Multiple authors**: Different authors for different documents
- **Guest authors**: One-off contributors with minimal profiles
- **Team pages**: Company or organization as author

## Example

Check out our example author pages:
- [[About/Authors/spaceship-co|Spaceship Co]] - Organization profile
- [[About/Authors/company-news|Company News]] - Department/team profile

## Technical Details

The author system:
- Validates author references in documents
- Supports custom author schemas with additional fields
- Integrates with the content collection API
- Works with both static generation and SSR
- Provides type-safe author data access
