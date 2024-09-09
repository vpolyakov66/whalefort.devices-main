/**
 * Метод обратный к isNullOrUndefined
 * @param value any
 * @returns boolean
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return typeof value !== 'undefined' && value !== null;
}
