import type { CreateItemAttrs } from '$services/types';

export const serialize = (attrs: CreateItemAttrs) => {
    const { createdAt, endingAt } = attrs

    return { ...attrs, createdAt: createdAt.toMillis(), endingAt:endingAt.toMillis() }
}
