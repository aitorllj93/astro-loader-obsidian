import { join } from 'node:path';
import mime from 'mime';


import { gplaces, documents, thumbnails } from "../../ioc";
import { mapGPlace2Place } from "../../mappers/gplace2place";
import type { PlaceInput, Handler } from "../../types";

import type definition from "./definition";
import type { places_v1 } from 'googleapis';

const getGPlace = async (name: string, googleId?: string) => {
	if (googleId) {
		const details = await gplaces.getPlaceDetails(googleId);

		if (!details) {
			throw new Error(`No place found for id: ${googleId}`);
		}

		return details;
	}

	const placeOpts = await gplaces.searchText(name);

	if (!placeOpts || placeOpts?.length <= 0) {
		throw new Error(`No place options found for text: ${name}`);
	}

	const gplace = placeOpts[0];

	if (!gplace) {
		throw new Error(`No place found for text: ${name}`);
	}

	return gplace;
}

const getGPhotos = async (gplace: places_v1.Schema$GoogleMapsPlacesV1Place) => {
	const photoAttrs = gplace.photos && gplace.photos.length > 0 ? gplace.photos[0] : undefined;

	if (!photoAttrs || !photoAttrs.name) {
		return null;
	}



	const photo = await gplaces.getPhoto(photoAttrs.name, photoAttrs.widthPx ?? 1200, photoAttrs.heightPx ?? 627);

	if (!photo) {
		return null;
	}

	return [photo];
}

const handler: Handler<typeof definition['input'], typeof definition['output']> = async ({
	name,
	path,
	entry = name,
}) => {
  try {
		const entryId = path ? join(path, entry) : entry;

		const existingDocument = await documents.getDocument<PlaceInput>(entryId);

		const gplace = await getGPlace(name, existingDocument?.attributes.identifier);

		if (!gplace) {
			throw new Error(`No place found for text: ${name}`);
		}

		const photos = await getGPhotos(gplace);

		const thumbnail = photos?.[0];

		if (thumbnail) {
			const cover = await thumbnails.addBlobThumbnail(entryId, thumbnail[0], mime.getExtension(thumbnail[1]) ?? undefined);
			thumbnail.push(cover);
		}

		const [meta, body] = mapGPlace2Place(entry, gplace, thumbnail, existingDocument ?? undefined);

		const content = await documents.addDocument(entryId, body, meta);

    return {
      content,
		}
  } catch (e) {
    console.error(e);
		throw new Error(`Error adding document ${name}. Reason: ${(e as Error).message}`);
  }

}

export default handler;
