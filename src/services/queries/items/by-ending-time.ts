import {client} from "$services/redis";
import {itemsEndingAtKey, itemsKey} from "$services/keys";
import {deserialize} from "$services/queries/items/deserialize";

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
	const results = await Promise.all(ids.map((id) => client.hGetAll(itemsKey(id))))

	return results.map(
		(item, i) => deserialize(ids[i], item)
	)
}
