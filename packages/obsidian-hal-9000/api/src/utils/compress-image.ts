import { unlink, writeFile } from "node:fs/promises";
import sharp from "sharp";

export default async function compressImage(source: string, target: string) {
  const buffStr = await sharp(source)
    .jpeg({
      mozjpeg: true,
      quality: 90,
    }).toBuffer() as unknown as Uint8Array<ArrayBufferLike>;

  // delete existing image if it's there
  await unlink(target).catch(() => null)

  await writeFile(target, buffStr);

  await unlink(source)

  return target;
}
