import {client} from "$services/redis";
import {itemsEndingAtKey} from "$services/keys";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
	const ids = await client.zRange(itemsEndingAtKey(), Date.now(), '+inf', {
			BY: 'SCORE',
			LIMIT: { offset, count }
		}
	)
	console.log(ids)
}
