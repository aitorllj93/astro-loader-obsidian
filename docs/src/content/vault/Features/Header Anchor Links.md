---
order: 30
---

Heading anchor links allow readers to link directly to specific sections of your content. When you hover over a heading, a link icon appears that you can click to get a shareable URL for that section.

## Features

- **Automatic ID generation**: Each heading automatically gets a unique ID based on its text
- **Hover-to-reveal links**: Link icons appear when hovering over headings (h1-h6)
- **Shareable URLs**: Click the link icon to get a URL with a hash anchor (#section-name)
- **Theme-integrated styling**: Link icons inherit the heading color for consistent appearance
- **Smooth transitions**: Links fade in/out smoothly on hover

## How It Works

The feature uses two rehype plugins:
- `rehype-slug`: Automatically generates IDs for all headings
- `rehype-autolink-headings`: Adds clickable link icons to headings

When a user clicks the link icon, the browser URL updates with the section anchor, making it easy to share direct links to specific content sections.

## Example

Try hovering over any heading on this page - you'll see a link icon appear on the right side. Click it to copy a direct link to that section!

### This is a subsection

The anchor link feature works on all heading levels (h1 through h6).

## Technical Details

The implementation includes:
- SVG link icon that matches your theme colors
- CSS transitions for smooth fade effects
- Accessibility features (aria-label, aria-hidden)
- Zero configuration required - works automatically on all headings

This feature is built into the Astro Spaceship theme and requires no additional setup.
