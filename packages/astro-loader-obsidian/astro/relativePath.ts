import path from 'node:path';

/**
 * Convert a platform path to a posix path.
 */
function posixifyPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}

/**
 * Unlike `path.posix.relative`, this function will accept a platform path and return a posix path.
 */
export function toRelativePath(from: string, to: string) {
  return posixifyPath(path.relative(from, to));
}
