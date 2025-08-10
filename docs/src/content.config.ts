
import authorsCollection from './collections/authors';
import documentsCollection from './collections/documents';
import tagsCollection from './collections/tags';

export const collections = {
	...authorsCollection,
	...documentsCollection,
	...tagsCollection,
};
