import type { CreateItemAttrs } from '$services/types';
import {genId} from "$services/utils";
import {serialize} from "$services/queries/items/serialize";
import {client} from "$services/redis";
import {itemsByViewsKey, itemsEndingAtKey, itemsKey} from "$services/keys";
import {deserialize} from "$services/queries/items/deserialize";

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id))
    if (Object.keys(item).length === 0) {
        return null
    }

    return deserialize(id, item)
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map((id) => {
        return client.hGetAll(itemsKey(id))
    })
    const results = await Promise.all(commands)

    return results.map((result, idx) => {
        if (Object.keys(result).length === 0) {
            return null
        }
        return deserialize(ids[idx], result)
    })
};

export const createItem = async (attrs: CreateItemAttrs) => {
    const id = genId()
    const serialized = serialize(attrs)
    const {endingAt} = attrs

    await Promise.all([
        await client.hSet(itemsKey(id), serialized),
        await client.zAdd(itemsByViewsKey(), {
            value: id,
            score: 0
        }),
        await client.zAdd(itemsEndingAtKey(), {
            value: id,
            score: endingAt.toMillis()
        })
    ])

    return id
}
