import { writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import compressImage from "../utils/compress-image";

export class ThumbnailRepository {
	constructor(private readonly cwd: string) { }

	public async addStringThumbnail(
		entry: string,
		image: string,
		format = 'jpg',
	) {
		const target = join(this.cwd, "Assets", `${entry}.${format}`);

		return this.writeStringThumbnail(target, image);
	}

	public async addBlobThumbnail(
		entry: string,
		image: Blob,
		format = 'jpg',
	) {
		const target = join(this.cwd, "Assets", `${entry}.${format}`);

		return this.writeBlobThumbnail(target, image);
	}

	private async writeStringThumbnail(
		target: string,
		image: string
	) {

		const image_bytes = Buffer.from(image, "base64");
		await writeFile(target, image_bytes as unknown as Uint8Array<ArrayBufferLike>);

		if (extname(target) !== '.png') {
			return target;
		}

		return this.compressImage(target);
	}

	private async writeBlobThumbnail(
		target: string,
		image: Blob
	) {
		const arrayBuffer = await image.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer) as unknown as Uint8Array<ArrayBufferLike>;

		await writeFile(target, buffer);

		if (extname(target) !== '.png') {
			return target;
		}

		return this.compressImage(target);
	}

	private async compressImage(
		target: string
	) {
		const jpgTarget = target.replace(".png", ".jpg");

		await compressImage(target, jpgTarget);

		return jpgTarget;
	}
}
