import type { Session } from '$services/types';
import {client} from "$services/redis";
import {sessionsKey} from "$services/keys";

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionsKey(id))
    if (Object.keys(session).length === 0) {
        return null
    }
    return deserialize(id, session)
}

export const saveSession = async (session: Session) => {
    const { id } = session

    return await client.hSet(sessionsKey(id), serialize(session))
}

const serialize = (session: Session) => {
    const { userId, username } = session

    return { userId, username }
}

const deserialize = (id: string, session: {[key: string]: string}) => {
    const { userId, username } = session

    return { id, userId, username }
}
