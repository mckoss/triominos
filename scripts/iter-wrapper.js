export { range, xrange, iwrap, IterWrapper, product };
function iwrap(iterator) {
    return new IterWrapper(iterator);
}
class IterWrapper {
    constructor(iterator) {
        this.iterable = iterator;
    }
    map(f) {
        return iwrap(this._map(f));
    }
    *_map(f) {
        for (let x of this.iterable) {
            yield f(x);
        }
    }
    filter(test) {
        return iwrap(this._filter(test));
    }
    *_filter(test) {
        for (let x of this.iterable) {
            if (test(x)) {
                yield x;
            }
        }
    }
    pair(iter) {
        return iwrap(this._pair(iter));
    }
    *_pair(iter) {
        for (let x of this.iterable) {
            for (let y of iter()) {
                yield [x, y];
            }
        }
    }
    *values() {
        for (let x of this.iterable) {
            yield x;
        }
    }
    array() {
        return Array.from(this.values());
    }
    forEach(f) {
        for (let x of this.iterable) {
            f(x);
        }
    }
}
function* range(start, stop, step = 1) {
    if (start === undefined) {
        let i = 0;
        while (true) {
            yield i++;
        }
    }
    if (stop === undefined) {
        stop = start;
        start = 0;
    }
    for (let i = start; i < stop; i += step) {
        yield i;
    }
}
function xrange(start, stop, step = 1) {
    return () => range(start, stop, step);
}
function* product(outer, ...xiters) {
    yield* _product(() => outer, ...xiters);
}
function* _product(...xiters) {
    let iterators = [];
    let lastNext = [];
    let tuple = [];
    function refresh(i) {
        iterators[i] = xiters[i]()[Symbol.iterator]();
        return getNext(i);
    }
    function getNext(i) {
        lastNext[i] = iterators[i].next();
        if (!lastNext[i].done) {
            tuple[i] = lastNext[i].value;
            return true;
        }
        return false;
    }
    let i = 0;
    while (true) {
        // Initialize iterators from i to end.
        while (i < xiters.length) {
            // Fresh iterator has no elements!  Yield nothing.
            if (!refresh(i)) {
                return;
            }
            i += 1;
        }
        yield Array.from(tuple);
        // i is now xiters.length
        // Roll back iterators that have completed.
        while (i > 0) {
            if (getNext(i - 1)) {
                break;
            }
            i -= 1;
        }
        // At this point, iterators starting at i
        // needs to be refreshed.
        if (i === 0) {
            return;
        }
    }
}
//# sourceMappingURL=iter-wrapper.js.map