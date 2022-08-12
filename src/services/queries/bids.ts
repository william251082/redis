import type { CreateBidAttrs, Bid } from '$services/types';
import {bidHistoryKey, itemsByPriceKey, itemsKey} from '$services/keys';
import {client, withLock} from '$services/redis';
import { DateTime } from 'luxon';
import {getItem} from "$services/queries/items";

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration)
	})
}

export const createBid = async (attrs: CreateBidAttrs) => {
	const { itemId, userId, amount, createdAt } = attrs

	return withLock(itemId, async (lockedClient: typeof client, signal: any) => {
		// 1) Fetch the item
		// 2) Do validation
		// 3) Writing some data
		const item = await getItem(itemId)

		// await pause(5000)

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

		if (signal.expired) {
			throw new Error('Lock expired, can\'t write anymore data')
		}

		return Promise.all([
			lockedClient.rPush(bidHistoryKey(itemId), serialized),
			lockedClient.hSet(itemsKey(item.id), {
				bids: item.bids + 1,
				price: amount,
				highestBidUserId: userId
			}),
			lockedClient.zAdd(itemsByPriceKey(), {
				value: item.id,
				score: amount
			})
		])
	})
	// return client.executeIsolated(async (isolatedClient) => {
	//
	// 	await isolatedClient.watch(itemsKey(itemId))
	//
	// 	const item = await getItem(itemId)
	// 	if (!item) {
	// 		throw new Error('Item does not exist')
	// 	}
	// 	if (item.price >= amount) {
	// 		throw new Error('Bid too low')
	// 	}
	// 	if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
	// 		throw new Error('item closed to bidding')
	// 	}
	// 	const serialized = serializeHistory(amount, createdAt.toMillis())
	//
	// 	return isolatedClient
	// 		.multi()
	// 		.rPush(bidHistoryKey(itemId), serialized)
	// 		.hSet(itemsKey(item.id), {
	// 			bids: item.bids + 1,
	// 			price: amount,
	// 			highestBidUserId: userId
	// 		})
	// 		.zAdd(itemsByPriceKey(), {
	// 			value: item.id,
	// 			score: amount
	// 		})
	// 		.exec()
	// })
}

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
