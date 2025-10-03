import { parseWikitags } from "./wikiTag";
import type { ObsidianContext } from "../types";
import type { AstroIntegrationLogger } from "astro";

// Mock logger
const mockLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
} as unknown as AstroIntegrationLogger;

// Mock context
const mockContext: ObsidianContext = {
  options: {
    tagsUrl: 'tags',
    parseTagsIntoLinks: true,
  },
  baseUrl: '/',
  defaultLocale: 'en',
} as ObsidianContext;

describe("parseWikitags", () => {
  describe("should parse valid wiki tags", () => {
    it("should parse a simple tag", () => {
      const content = "This is a #test tag";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("#test");
      expect(result[0].link.title).toBe("test");
    });

    it("should parse multiple tags", () => {
      const content = "Tags: #first #second #third";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(3);
      expect(result[0].text).toBe("#first");
      expect(result[1].text).toBe("#second");
      expect(result[2].text).toBe("#third");
    });

    it("should parse tags with nested paths", () => {
      const content = "This has #category/subcategory tag";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("#category/subcategory");
      expect(result[0].link.title).toBe("subcategory");
    });

    it("should parse tags with numbers and hyphens", () => {
      const content = "Tags: #test-123 #abc_def";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe("#test-123");
      expect(result[1].text).toBe("#abc_def");
    });
  });

  describe("should NOT parse hashtags inside HTML tags", () => {
    it("should ignore hex color codes in style attributes", () => {
      const content = '<div style="color: #EEE">Some text</div>';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should ignore hex color codes in iframe style attributes", () => {
      const content = '<iframe src="https://example.com" style="border:1px solid #EEE; background:white;" frameborder="0"></iframe>';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should ignore multiple hex codes in a single HTML tag", () => {
      const content = '<div style="color: #ABC; background: #DEF; border: 1px solid #123">Text</div>';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should ignore hashtags in HTML attributes", () => {
      const content = '<a href="/page#section">Link</a>';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });
  });

  describe("should handle mixed content correctly", () => {
    it("should parse tags outside HTML but not inside", () => {
      const content = 'This is #valid-tag <div style="color: #EEE">with HTML</div> and another #good-tag';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe("#valid-tag");
      expect(result[1].text).toBe("#good-tag");
    });

    it("should handle tags after HTML elements", () => {
      const content = '<div style="color: #FFF"></div> #actual-tag';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("#actual-tag");
    });

    it("should handle tags before HTML elements", () => {
      const content = '#actual-tag <div style="color: #FFF"></div>';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("#actual-tag");
    });

    it("should handle complex mixed content", () => {
      const content = `
        # Heading with #real-tag

        Some text with #another-tag here.

        <iframe src="https://example.com" style="border:1px solid #EEE; background:white;"></iframe>

        More text with #final-tag.
      `;
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(3);
      expect(result[0].text).toBe("#real-tag");
      expect(result[1].text).toBe("#another-tag");
      expect(result[2].text).toBe("#final-tag");
    });
  });

  describe("should handle edge cases", () => {
    it("should not parse hashtags preceded by word characters", () => {
      const content = "word#notag and test#alsonotag";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should not parse hashtags preceded by colon", () => {
      const content = "url::#notag";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should not parse hashtags preceded by slash", () => {
      const content = "path/#notag";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should handle empty content", () => {
      const content = "";
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });

    it("should handle content with only HTML", () => {
      const content = '<div style="color: #EEE; background: #FFF"></div>';
      const result = parseWikitags(content, 'body', mockContext, mockLogger);

      expect(result).toHaveLength(0);
    });
  });
});
