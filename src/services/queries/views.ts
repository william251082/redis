import { client } from '$services/redis';

export const incrementView = async (itemId: string, userId: string) => {
	return client.incrementView(itemId, userId)
}

// Keys need to access
// 1) itemsViewsKey
// 1) itemsKey -> items#vgbhluv
// 1) itemsByViewsKey
// EVALSHA ID 3

// Arguments I need to accept
// 1) itemId
// 2) userId
