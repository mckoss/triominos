import { suite, test } from 'mocha';
import { assert } from 'chai';
import { Triomino, Tile, TilePos, VertexPos } from './triomino.js';
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
        let origin = new TilePos();
        assert.equal(tm.getTile(origin), undefined);
        let tile = tm.unplayed.values().next().value;
        assert.notEqual(tile, undefined);
        tm.playTile(tile, origin, 0);
        // Played tile should be on the board.
        assert.equal(tm.getTile(origin), tile);
        // And removed from the as-yet unplayed set.
        assert.isFalse(tm.unplayed.has(tile));
        assert.equal(tm.unplayed.size, 55);
        let tile2 = tm.unplayed.values().next().value;
        assert.throws(() => {
            tm.playTile(tile2, origin, 0);
        }, "No available play");
        assert.throws(() => {
            tm.playTile(tile2, new TilePos(10, 10), 0);
        }, "No available play");
    });
    test('availablePositions', () => {
        let tm = new Triomino();
        let origin = new TilePos();
        let tile = tm.unplayed.values().next().value;
        assert.equal(tm.available.size, 1);
        assert.notEqual(tm.available.get('0, 0'), undefined);
        tm.playTile(tile, origin, 0);
        assert.equal(tm.available.size, 3);
        tile = tm.unplayed.values().next().value;
        tm.playTile(tile, new TilePos(0, 1), 0);
        assert.equal(tm.available.size, 4);
        assert.isTrue(tm.board.has('0, 0'));
        assert.isTrue(tm.board.has('0, 1'));
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
    test('toString', () => {
        let t = new Tile([1, 2, 3]);
        assert.equal(t.toString(), 'Tile<1, 2, 3>');
    });
});
suite('Tile Position', () => {
    test('constructor', () => {
        let p = new TilePos();
        assert.equal(p.key(), '0, 0');
        p = new TilePos(1, 2);
        assert.equal(p.key(), '1, 2');
    });
    test('adjacentPositions', () => {
        let tests = [
            { pos: new TilePos(), adjacents: [[0, 1], [0, -1], [-1, 1]] },
            { pos: new TilePos(0, -1), adjacents: [[0, 0], [1, -2], [0, -2]] }
        ];
        for (let test of tests) {
            let s = new Set(Array.from(test.pos.adjacentPositions(), value => value.key()));
            assert.equal(s.size, 3);
            for (let item of test.adjacents) {
                assert.isTrue(s.has(new TilePos(item[0], item[1]).key()), `missing ${item} from ${Array.from(s.values())}`);
            }
        }
    });
    test('getVertices', () => {
        let tests = [
            { pos: new TilePos(0, 0), verts: ['V0, 0', 'V0, 1', 'V1, 0'] },
            { pos: new TilePos(0, 1), verts: ['V0, 1', 'V1, 1', 'V1, 0'] },
            { pos: new TilePos(0, 2), verts: ['V0, 1', 'V0, 2', 'V1, 1'] },
            { pos: new TilePos(1, 0), verts: ['V1, 0', 'V1, 1', 'V2, 0'] },
        ];
        for (let test of tests) {
            let v = Array.from(test.pos.getVertices()).map(v => v.key());
            assert.deepEqual(v, test.verts, test.pos.key());
        }
    });
});
suite('Vertex Position', () => {
    test('constructor', () => {
        let v = new VertexPos();
        assert.equal(v.key(), 'V0, 0');
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