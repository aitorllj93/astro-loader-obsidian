export function isConfigFile(file: string, baseDir: string) {
  const fileUrl = new URL(file, baseDir);
  return fileUrl.pathname.includes('.obsidian');
}
