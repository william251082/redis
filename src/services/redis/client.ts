import {createClient, defineScript} from 'redis';

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
