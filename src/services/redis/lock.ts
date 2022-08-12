import {randomBytes} from "crypto";
import {client} from "$services/redis/client";
import type {Client} from "../../../worker/client";

export const withLock = async (key: string, cb: (redisClient: Client, signal: any) => any) => {
	// Initialize a few variables to control retry behavior
	const retryDelayMs = 100
	const timeoutMs = 2000
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
			}, timeoutMs)
			const proxiedClient = buildClientProxy(timeoutMs)

			return await cb(proxiedClient, signal)
		} finally {
			// UNSET the locked set
			await client.unlock(lockKey, token)
		}
	}
}

const buildClientProxy = (timeoutMs: number) => {
	const startTime = Date.now()

	const handler = {
		get(target: Client, prop: keyof Client) {
			if (Date.now() >= startTime + timeoutMs) {
				throw new Error('Lock has expired')
			}
			const value = target[prop]

			return typeof value === 'function' ? value.bind(target) : value
		}
	}

	return new Proxy(client, handler) as Client
}

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration)
	})
}


