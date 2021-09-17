export { cloneMap, cloneSet }
// Utilities to make deep clones of Sets and Maps.

interface Cloneable {
    clone(): this;
}

function cloneMap<K, V extends Cloneable>(m: Map<K, V>): Map<K, V> {
    let newMap: Map<K, V> = new Map();

    for (let [k, v] of m.entries()) {
        newMap.set(k, v.clone());
    }

    return newMap;
}

function cloneSet<V extends Cloneable>(s: Set<V>): Set<V> {
    let newSet: Set<V> = new Set();

    for (let v of s) {
        newSet.add(v.clone());
    }

    return newSet;
}