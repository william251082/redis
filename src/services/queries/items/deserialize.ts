import type { Item } from '$services/types';
import { DateTime } from 'luxon';

export const deserialize = (itemId: string, item: { [key: string]: string }): Item => {
    const { id, name, ownerId, imageUrl, description, highestBidUserId } = item
    const createdAt = DateTime.fromMillis(parseInt(item.createdAt))
    const endingAt = DateTime.fromMillis(parseInt(item.endingAt))
    const views = parseInt(item.views)
    const likes = parseInt(item.likes)
    const price = parseInt(item.price)
    const bids = parseInt(item.bids)
    return {
        id,
        name,
        ownerId,
        imageUrl,
        description,
        createdAt,
        endingAt,
        views,
        likes,
        price,
        bids,
        highestBidUserId
    }
}
