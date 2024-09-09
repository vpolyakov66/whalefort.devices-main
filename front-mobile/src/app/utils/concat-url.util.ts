/**
 * конкатенация урла из нескольких частей
 * @param uri исходный uri
 * @param segments части которые ндо добавить к uri
 * @returns {string}
 */
export function concatUrl(uri: string, ...segments: string[]): string {
    if (!segments || !uri) {
        return uri;
    }
    if (!uri.endsWith('/')) {
        uri += '/';
    }
    for (const segment of segments) {
        let r: string = segment;
        if (segment && segment.startsWith('/')) {
            r = segment.substr(1);
        }
        if (uri[uri.length - 1] !== '/') {
            uri += '/';
        }
        uri += r;
    }

    return uri;
}
