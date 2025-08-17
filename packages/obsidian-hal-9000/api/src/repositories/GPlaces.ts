
import { google, type places_v1 } from 'googleapis';

const places = 'GOOGLE_API_KEY' in process.env ? google.places({
  version: 'v1',
  auth: process.env.GOOGLE_API_KEY,
}) : null;

export const DETAILS_FIELDS = [
	'id',
	'displayName',
	'editorialSummary',
	'generativeSummary',
	'types',
	'formattedAddress',
	'internationalPhoneNumber',
	'currentOpeningHours',
	'googleMapsUri',
	'location',
	'photos',
	'primaryType',
	'websiteUri',
] as const;

export type PlaceDetailFields = typeof DETAILS_FIELDS[number];

export type PlaceDetails = Pick<NonNullable<places_v1.Schema$GoogleMapsPlacesV1Place>, PlaceDetailFields>;

export class GPlaces {

	async searchText(textQuery: string, languageCode = 'es') {
		this.assertPlacesIsDefined(places);
		const result = await places?.places.searchText({
			fields: DETAILS_FIELDS.map(f => `places.${f}`).join(','),
			requestBody: {
				languageCode,
				textQuery,
				pageSize: 1,
			},
		})

		return result?.data.places as PlaceDetails[] | undefined;
	}

	async getPlaceDetails(placeId: string, languageCode = 'es') {
		this.assertPlacesIsDefined(places);
		const result = await places?.places.get({
			fields: DETAILS_FIELDS.join(','),
			languageCode,
			name: `places/${placeId}`,
		})

		return result?.data as PlaceDetails | undefined;
	}

	async getPhoto(name: string, maxWidthPx: number, maxHeightPx: number,): Promise<[
		Blob, string
	]> {
		this.assertPlacesIsDefined(places);

		const result = await places?.places.photos.getMedia({
			name: `${name}/media`,
			maxHeightPx,
			maxWidthPx,
		});

		if (!result) {
			throw new Error('Result is undefined');
		}
		
		const contentType = (result.headers as unknown as Headers).get('content-type') ?? 'image/png';

		return [result.data as Blob, contentType];
	}

	private assertPlacesIsDefined(p: places_v1.Places|null): p is places_v1.Places {
		if (!places) {
			throw new Error('Places is not defined. Did you forgot to include "GOOGLE_API_KEY" env var?')
		}

		return true;
	}
}
