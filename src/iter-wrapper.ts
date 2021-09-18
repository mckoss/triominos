export { range, xrange, iwrap, IterWrapper, product };

function iwrap<T>(iterator: Iterable<T>) {
    return new IterWrapper(iterator);
}

class IterWrapper<T> {
    iterable: Iterable<T>;

    constructor(iterator: Iterable<T>) {
        this.iterable = iterator;
    }

    map<U>(f: (value: T) => U): IterWrapper<U> {
        return iwrap(this._map(f));
    }

    *_map<U>(f: (value: T) => U): Generator<U> {
        for (let x of this.iterable) {
            yield f(x);
        }
    }

    filter(test: (value: T) => boolean): IterWrapper<T> {
        return iwrap(this._filter(test));
    }

    *_filter(test: (value: T) => boolean): Generator<T> {
        for(let x of this.iterable) {
            if (test(x)) {
                yield x;
            }
        }
    }

    pair<U>(iter: () => Iterable<U>): IterWrapper<[T, U]> {
        return iwrap(this._pair(iter));
    }

    *_pair<U>(iter: () => Iterable<U>) : Generator<[T, U]> {
        for (let x of this.iterable) {
            for (let y of iter()) {
                yield [x, y];
            }
        }
    }

    *values(): Generator<T> {
        for (let x of this.iterable) {
            yield x;
        }
    }

    array(): T[] {
        return Array.from(this.values());
    }

    forEach(f: (value: T) => undefined) {
        for (let x of this.iterable) {
            f(x);
        }
    }
}

function *range(start?: number, stop?: number, step: number = 1): Generator<number> {
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

function xrange(start?: number, stop?: number, step: number = 1): () => Iterable<number> {
    return () => range(start, stop, step);
}

function *product(outer: Iterable<any>, ...xiters: (() => Iterable<any>)[]) : Generator<any[]> {
    yield *_product(() => outer, ...xiters);
}

function *_product(...xiters: (() => Iterable<any>)[]) : Generator<any[]> {
    let iterators: Iterator<any>[] = [];
    let lastNext: IteratorResult<any>[] = [];
    let tuple: any[] = [];

    function refresh(i: number) : boolean {
        iterators[i] = xiters[i]()[Symbol.iterator]();
        return getNext(i);
    }

    function getNext(i: number) : boolean {
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
