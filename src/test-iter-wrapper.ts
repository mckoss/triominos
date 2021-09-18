import { suite, test } from 'mocha';
import { assert} from 'chai';

import { range, xrange, iwrap, product } from './iter-wrapper.js'

suite('Iter Wrapper', () => {
    test('iwrap range', () => {
        let squares = iwrap(range(5)).map(x => x * x).values();
        assert.deepEqual(Array.from(squares), [0, 1, 4, 9, 16]);
    })

    test('nested maps', () => {
        assert.deepEqual(Array.from(iwrap(range(4)).map(x => x * x).map(x => x.toString()).values()),
            ['0', '1', '4', '9']);
    });

    test('array', () => {
        assert.deepEqual(iwrap(range(5)).array(), [0, 1, 2, 3, 4]);
    });

    test('filter', () => {
        assert.deepEqual(iwrap(range(10)).filter(x => x % 2 === 0).array(), [0, 2, 4, 6, 8]);
    });

    test('tuple', () => {
        assert.deepEqual(iwrap(range(3)).pair(xrange(2)).array(),
            [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]]);
    });

    test('triomino', () => {
        // Emulate Python List Comprehension
        // included = [[a, b, c] for a in range(6) for b in range(a, 6) for c in range(b, 6)]
        // missing = [[a, b, c] for a in range(6) for b in range(a+2, 6) for c in range(a+1, 6) if c < b]

        let included = iwrap(product(range(6), xrange(6), xrange(6)))
            .filter(([a, b, c]) => a <= b && b <= c)
            .array();
        assert.equal(included.length, 56);

        let missing = iwrap(product(range(6), xrange(6), xrange(6)))
            .filter(([a, b, c]) => b > a && c > a && c < b)
            .array();
        assert.equal(missing.length, 20);
    });
});

suite('range', () => {
    test('no args - indefinite', () => {
        let i = 0;
        for (let j of range()) {
            assert.equal(i, j);
            i++;
            if (i === 101) {
                break;
            }
        }
    });

    test('one arg - stop', () => {
        let count = 0;
        let i = 0;
        for (i of range(10)) {
            count++;
        }
        assert.equal(count, 10);
        assert.equal(i, 9);
    })

    test('two args - start, stop', () => {
        let arr: number[] = [];
        for (let i of range(3, 9)) {
            arr.push(i);
        }
        assert.deepEqual(arr, [3, 4, 5, 6, 7, 8]);
    });

    test('three args - start, stop, step', () => {
        let arr = Array.from(range(3, 9, 2));
        assert.deepEqual(arr, [3, 5, 7]);
    });
});
