import {client} from "$services/redis";
import {itemsIndexKey} from "$services/keys";
import {deserialize} from "$services/queries/items/deserialize";

interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
	tag: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
	const { page, perPage, sortBy, direction } = opts
	const query = `@ownerId:{${userId}}`
	const sortCriteria = sortBy && direction && {
		BY: sortBy, DIRECTION: direction
	}
	const { total, documents } = await client.ft.search(itemsIndexKey(), query, {
		ON: 'HASH',
		SORTBY: sortCriteria,
		LIMIT: {
			from: page * perPage,
			size: perPage
		}
	} as any);

	return {
		totalPages: Math.ceil(total / perPage),
		items: documents.map(({ id, value }) => {
			return deserialize(id.replace('items#', ''), value as any)
		})
	}
}
