import { DocumentRepository } from "./repositories/Documents";
import { GPlaces } from "./repositories/GPlaces";
import { ThumbnailRepository } from "./repositories/Thumbnails";

const VAULT_DIR = process.env.VAULT_DIR;

const documents = new DocumentRepository(VAULT_DIR);
const thumbnails = new ThumbnailRepository(VAULT_DIR);
const gplaces = new GPlaces()

export {
	documents,
	thumbnails,
	gplaces,
}
