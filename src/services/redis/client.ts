import {createClient, defineScript} from 'redis';
import {itemsByViewsKey, itemsKey, itemsViewsKey} from "$services/keys";

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,
	scripts: {
		addOneAndStore: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				local storeAtKey = KEYS[1]
				local addOneTo = ARGV[1]
				
				return redis.call(
					'SET', storeAtKey, 1 + tonumber(addOneTo)
				)
			`,
			transformArguments(key: string, value: number) {
				return [key, value.toString()]
				// ['books:count', '5']
				// EVALSHA <ID> 1 'books:count' '5'
			},
			transformReply(reply: any): any {
				return reply
			}
		}),
		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT: `
				local itemsViewsKey = KEYS[1]
				local itemsKey = KEYS[2]
				local itemsByViewsKey = KEYS[3]
				local itemId = ARGV[1]
				local userId = ARGV[2]
				local inserted = redis.call(
					'PFADD', itemsViewsKey, userId
				)
				if inserted == 1 then
					redis.call('HINCRBY', itemsKey, 'views', 1)
					redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
				end
			`,
			transformArguments(itemId: string, userId: string) {
				return [
					itemsViewsKey(itemId), // -> items:views#asdf
					itemsKey(itemId), // -> items#asdf
					itemsByViewsKey(), // -> items:views
					itemId, // -> asdf
					userId	// -> 123asdf
				]
				// EVALSHA ID 3 items:views#asdf items#asdf items:views asdf 123asdf
			},
			transformReply(reply: any): any {}
		})
	}
});

client.on('connect', async () => {
	await client.addOneAndStore('books:count', 51)
	const result = await client.get('books:count')
	// console.log(result)
})

client.on('error', (err) => console.error(err));
client.connect();

export { client };
