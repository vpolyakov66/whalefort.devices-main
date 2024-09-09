export function clearObject<T extends Object>(o: T): T {
    return Object.fromEntries(Object.entries(o).filter(([ _, v ]) => v != null)) as T;
}
