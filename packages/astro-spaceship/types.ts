
export type SpaceshipConfig = {
  author?: string;
  base?: string;
  defaultLocale: string;
  description?: string;
  site?: string;
  title: string;
  displayOptions?: {
    showAuthor?: boolean;
    showPublishDate?: boolean;
  }
};