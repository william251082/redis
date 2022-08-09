import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import {client} from "$services/redis";
import {usernamesKey, usernamesUniqueKey, usersKey} from "$services/keys";

export const getUserByUsername = async (username: string) => {
    const decimalId = await client.zScore(usernamesKey(), username)
    if (!decimalId) {
        throw new Error('User  does not exist')
    }
    const id  = decimalId.toString(16)
    const user = await client.hGetAll(usersKey(id))

    return deserialize(id, user)
}

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id))
    if (Object.keys(user).length === 0) {
        return null
    }
    return deserialize(id, user)
}

export const createUser = async (attrs: CreateUserAttrs) => {
    const id = genId()
    const { username } = attrs
    const exists = await client.sIsMember(usernamesUniqueKey(), username)
    if (exists) {
        throw new Error('Username is taken')
    }
    await client.hSet(usersKey(id), serialize(attrs))
    await client.sAdd(usernamesUniqueKey(), username)
    await client.zAdd(usernamesKey(), {
        value: username,
        score: parseInt(id, 16)
    })

    return id
}

const serialize = (user: CreateUserAttrs) => {
    const { username, password } = user

    return { username, password }
}

const deserialize = (id: string, user: {[key: string]: string}) => {
    const { username, password } = user

    return { id, username, password }
}
