import { suite, test } from 'mocha';
import { assert} from 'chai';
import { Triomino, Tile, Value } from './triomino.js'


suite('Triomino', () => {

    test('constructor', () => {
        const tm = new Triomino();
        assert.notEqual(tm, undefined);
        assert.equal(tm.unplayed.size, 56);
    })

    test('tiles', () => {
        let tests = [
            {tiles: Triomino.includedTiles(), count: 56},
            {tiles: Triomino.missingTiles(), count: 20},
            {tiles: Triomino.allTiles(), count: 76}
        ];
        for (let test of tests) {
            assert.equal(test.tiles.length, test.count);
            assert.isTrue(allUnique(test.tiles));
        }
    });
});

function allUnique(items: Iterable<any>) {
    let s = new Set();
    for (let i of items) {
        if (s.has(i)) {
            console.log(`${i} is duplicated`)
            return false;
        }
        s.add(i);
    }
    return true;
}

suite('Tile', () => {
    test('constructor', () => {
        const t = new Tile([0, 0, 0]);
        assert.notEqual(t, undefined);
    })
});