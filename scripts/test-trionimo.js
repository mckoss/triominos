import { suite, test } from 'mocha';
import { assert } from 'chai';
import { Triomino, Tile, Position } from './triomino.js';
suite('Triomino', () => {
    test('constructor', () => {
        const tm = new Triomino();
        assert.notEqual(tm, undefined);
        assert.equal(tm.unplayed.size, 56);
    });
    test('tiles', () => {
        let tests = [
            { tiles: Triomino.includedTiles(), count: 56 },
            { tiles: Triomino.missingTiles(), count: 20 },
            { tiles: Triomino.allTiles(), count: 76 }
        ];
        for (let test of tests) {
            assert.equal(test.tiles.length, test.count);
            assert.isTrue(allUnique(test.tiles));
        }
    });
    test('getTile/playTile', () => {
        let tm = new Triomino();
        let origin = new Position();
        assert.equal(tm.getTile(origin), undefined);
        let tile = tm.unplayed.values().next().value;
        assert.notEqual(tile, undefined);
        tm.playTile(tile, origin, 0);
        // Played tile should be on the board.
        assert.equal(tm.getTile(origin), tile);
        // And removed from the as-yet unplayed set.
        assert.isFalse(tm.unplayed.has(tile));
        assert.equal(tm.unplayed.size, 55);
    });
});
suite('Tile', () => {
    test('constructor', () => {
        const t = new Tile([0, 0, 0]);
        assert.notEqual(t, undefined);
    });
    test('Vertices', () => {
        const t = new Tile([1, 2, 3]);
        assert.equal(t.getValue(0), 1, '0');
        assert.equal(t.getValue(1), 2, '1');
        assert.equal(t.getValue(2), 3, '2');
        t.rot = 1;
        assert.equal(t.getValue(0), 3);
        t.rot = 2;
        assert.equal(t.getValue(0), 2);
    });
});
suite('Position', () => {
    test('constructor', () => {
        let p = new Position();
        assert.equal(p.key(), '0-0');
        p = new Position(1, 2);
        assert.equal(p.key(), '1-2');
    });
});
// Helper function - return true if all in Iterable are different.
function allUnique(items) {
    let s = new Set();
    for (let i of items) {
        if (s.has(i)) {
            console.log(`${i} is duplicated`);
            return false;
        }
        s.add(i);
    }
    return true;
}
//# sourceMappingURL=test-trionimo.js.map