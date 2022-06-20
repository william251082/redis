import type { CreateItemAttrs } from '$services/types';
import {DateTime} from "luxon";

export const serialize = (attrs: CreateItemAttrs) => {
    if (!attrs.createdAt) {
        attrs.createdAt = DateTime.now()
    }
    if (!attrs.endingAt) {
        attrs.endingAt = DateTime.now()
    }
    const { createdAt, endingAt } = attrs

    return { ...attrs, createdAt: createdAt.toMillis(), endingAt:endingAt.toMillis() }
}
