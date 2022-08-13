export const searchItems = async (term: string, size: number = 5) => {
    const cleaned = term
        .replaceAll(/^a-zA-Z0-9/g, '')
        .trim()
        .split(' ')
        .map((word) => word ? `%${word}%` : '')
        .join(' ')
}
