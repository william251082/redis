import {randomBytes} from "crypto";
import {client} from "$services/redis/client";

export const withLock = async (key: string, cb: (signal: any) => any) => {
	// Initialize a few variables to control retry behavior
	const retryDelayMs = 100
	let retries = 20

	// Generate a random value to store at the lock key
	const token = randomBytes(6).toString('hex')
	// Create a lock key
	const lockKey = `lock:${key}`

	// Setup a while loop to implement the retry behaviour
	while(retries >= 0) {
		retries--
		// Try to do a SET NX operation
		const acquired = await client.set(lockKey, token, {
			NX: true,
			PX: 2000
		})
		if (!acquired) {
			// ELSE brief pause (retryDelayMs) and then retry
			await pause(retryDelayMs)
			continue
		}
		// IF the SET is successful, then run the callback
		try {
			const signal = { expired: false }
			setTimeout (() => {
				signal.expired = true
			}, 2000)
			return await cb(signal)
		} finally {
			// UNSET the locked set
			await client.unlock(lockKey, token)
		}
	}
}

const buildClientProxy = () => {};


