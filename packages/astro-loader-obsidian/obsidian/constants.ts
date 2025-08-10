

export const OBSIDIAN_CONFIG_FOLDER = '.obsidian';

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".md"
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".avif",
  ".tiff",
  ".bmp",
  ".ico",
] as const;

export const ALLOWED_AUDIO_EXTENSIONS = ['.flac', '.m4a', '.mp3', '.wav', '.ogg', '.wav', '.3gp'] as const;

export const ALLOWED_VIDEO_EXTENSIONS = ['.mkv', '.mov', '.mp4', '.ogv', '.webm'] as const;


export const ALLOWED_FILE_EXTENSIONS = [
  ".pdf"
] as const;

export const ALLOWED_ASSET_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_AUDIO_EXTENSIONS,
  ...ALLOWED_VIDEO_EXTENSIONS,
  ...ALLOWED_FILE_EXTENSIONS,
] as const;