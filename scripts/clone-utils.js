export { cloneMap, cloneSet };
function cloneMap(m) {
    let newMap = new Map();
    for (let [k, v] of m.entries()) {
        newMap.set(k, v.clone());
    }
    return newMap;
}
function cloneSet(s) {
    let newSet = new Set();
    for (let v of s) {
        newSet.add(v.clone());
    }
    return newSet;
}
//# sourceMappingURL=clone-utils.js.map