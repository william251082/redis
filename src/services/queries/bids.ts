import type { CreateBidAttrs, Bid } from '$services/types';
import {bidHistoryKey, itemsKey, userLikesKey} from '$services/keys';
import { client } from '$services/redis';
import { DateTime } from 'luxon';
import {getItem} from "$services/queries/items";

export const createBid = async (attrs: CreateBidAttrs) => {
	const { itemId, userId, amount, createdAt } = attrs
	const item = await getItem(itemId)
	if (!item) {
		throw new Error('Item does not exist')
	}
	if (item.price >= amount) {
		throw new Error('Bid too low')
	}
	if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
		throw new Error('item closed to bidding')
	}
	const serialized = serializeHistory(amount, createdAt.toMillis())

	await Promise.all([
		client.rPush(bidHistoryKey(itemId), serialized),
		client.hSet(itemsKey(item.id), {
			bids: item.bids + 1,
			price: amount,
			highestBidUserId: userId
		})
	])
	return
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;

	const range = await client.lRange(bidHistoryKey(itemId), startIndex, endIndex);

	return range.map((bid) => deserializeHistory(bid));
};

const serializeHistory = (amount: number, createdAt: number) => {
	return `${amount}:${createdAt}`;
};

const deserializeHistory = (stored: string) => {
	const [amount, createdAt] = stored.split(':');

	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt))
	};
};
