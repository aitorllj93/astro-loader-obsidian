import type { places_v1 } from "googleapis"
import type { PlaceInput } from "../types"
import type { PlaceDetails } from "../repositories/GPlaces";

const getWeekDays = (localeName = 'es-ES', weekday: Intl.DateTimeFormatOptions['weekday'] = 'long') => {
  const {format} = new Intl.DateTimeFormat(localeName, { weekday });
  return [...Array(7).keys()]
    .map((day) => format(new Date(Date.UTC(2021, 5, day))));
}

const mapOpeningHoursToMDTable = ({
	currentOpeningHours,
}: places_v1.Schema$GoogleMapsPlacesV1Place): string => {
	const weekdays = getWeekDays();

	if (!currentOpeningHours?.periods) return '';

	return `
## Horario

| Día  | Apertura  | Cierre  |
|---|---|---|
${currentOpeningHours.periods.map(({ open, close }) => `| ${open ? weekdays[open.day ?? 0] : ''} | ${open?.hour?.toString().padStart(2, '0')}:${open?.minute?.toString().padStart(2, '0')} | ${close?.hour?.toString().padStart(2, '0')}:${close?.minute?.toString().padStart(2, '0')} |`).join('\n')}`;}

const getAliases = (
	entry: string,
	{ displayName }: places_v1.Schema$GoogleMapsPlacesV1Place,
	existingDocument?: {
		attributes: PlaceInput,
		body: string,
	}
) => {
	const gplaceAliases = displayName && displayName?.text !== entry ? [displayName.text as string] : undefined;

	if (!gplaceAliases && !existingDocument) {
		return undefined;
	}

	return [...new Set([...gplaceAliases ?? [], ...existingDocument?.attributes.aliases ?? []])];
}

const getTags = (
	entry: string,
	{ types }: places_v1.Schema$GoogleMapsPlacesV1Place,
	existingDocument?: {
		attributes: PlaceInput,
		body: string,
	}
) => {
	const gplaceTags = types && types.length > 0 ? types.map(t => `types/${t}`) : undefined

	if (!gplaceTags && !existingDocument) {
		return undefined;
	}

	return [...new Set([...gplaceTags ?? [], /* ...existingDocument?.attributes.tags ?? [] */])];
}

export const mapGPlace2Place = (
	entry: string,
	gplace: PlaceDetails,
	thumbnail?: [Blob, string, string?],
	existingDocument?: {
		attributes: PlaceInput,
		body: string,
	}
): [PlaceInput, string] => {
	const {
		id,
		formattedAddress,
		location,
		editorialSummary,
		generativeSummary,
		googleMapsUri,
		primaryType,
	} = gplace;

	// TODO: cover & photos https://developers.google.com/maps/documentation/places/web-service/place-photos?hl=es-419
	// https://places.googleapis.com/v1/places/ChIJ2fzCmcW7j4AR2JzfXBBoh6E/photos/AUacShh3_Dd8yvV2JZMtNjjbbSbFhSv-0VmUN-uasQ2Oj00XB63irPTks0-A_1rMNfdTunoOVZfVOExRRBNrupUf8TY4Kw5iQNQgf2rwcaM8hXNQg7KDyvMR5B-HzoCE1mwy2ba9yxvmtiJrdV-xBgO8c5iJL65BCd0slyI1/media?maxHeightPx=400&maxWidthPx=400&key
	const frontmatter: PlaceInput = {
		'@type': 'Place',
		additionalType: primaryType ?? undefined,
		address: formattedAddress ?? undefined,
		description: generativeSummary?.overview?.text ?? editorialSummary?.text ?? undefined,
		identifier: id ?? undefined,
		url: googleMapsUri ?? undefined,
		location: location?.latitude && location.longitude ? [
			`${location.latitude}, ${location.longitude}`
		] : undefined,
		...existingDocument?.attributes,
		cover: thumbnail && thumbnail.length > 2 ? `[[${entry}.jpg]]` : undefined, 
		aliases: getAliases(entry, gplace, existingDocument),
		tags: getTags(entry, gplace, existingDocument),
	};

	let body = `${mapOpeningHoursToMDTable(gplace)}`;

	if (existingDocument?.body && existingDocument.body.length > 0) {
		body = existingDocument.body
		// if (existingDocument.body.includes(body)) {
		// 	body = existingDocument.body
		// } else {
		// 	body = `${existingDocument.body}\n${body}`
		// }
	}

	return [frontmatter, body];
}
