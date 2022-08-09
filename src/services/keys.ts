export const pageCacheKey = (id:string) => `pagecache#${id}`
export const usersKey = (id:string) => `users#${id}`
export const sessionsKey = (id:string) => `sessions#${id}`
export const usernamesUniqueKey = () => `usernames:unique`
export const userLikesKey = (id:string) => `users:likes${id}`
export const usernamesKey = () => 'usernames'

export const itemsKey = (itemId:string) => `items#${itemId}`
export const itemsByViewsKey = () => 'items:views'
export const itemsEndingAtKey = () => 'items:endingAt'
export const itemsViewsKey = (itemId:string) => `items:views#${itemId}`
