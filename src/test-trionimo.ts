import { suite, test } from 'mocha';
import { assert} from 'chai';
import { Triomino, Tile, Value, TilePos, VertexPos, TileDef, Rotation } from './triomino.js'

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

    test('playableRot', () => {
        let tm = new Triomino();
        let origin = new TilePos();

        let tile = tm.unplayed.values().next().value;
        assert.equal(tm.playableRot(tile, origin), 0);
        assert.equal(tm.playableRot(new Tile([0, 0, 0]), origin), 0);

        assert.throws(() => {
            tm.playableRot(new Tile([2, 1, 3]), origin);
        }, "unplayed set");
    });

    test('playableTiles', () => {
        let tm = new Triomino();
        assert.equal(countIter(tm.playableTiles()), 56);

        let tile = tm.unplayed.values().next().value;
        tm.playTile(tile, new TilePos());
        assert.deepEqual(Array.from(tm.playableTiles()).map(tile => `${tile}`),
            [
                "Tile<0, 0, 1>",
                "Tile<0, 0, 2>",
                "Tile<0, 0, 3>",
                "Tile<0, 0, 4>",
                "Tile<0, 0, 5>"
            ]);
    });

    test('getTile/playTile', () => {
        let tm = new Triomino();
        let origin = new TilePos();
        assert.equal(tm.getTile(origin), undefined);

        let tile = tm.unplayed.values().next().value;
        assert.notEqual(tile, undefined);
        tm.playTile(tile, origin);

        // Played tile should be on the board.
        assert.equal(tm.getTile(origin), tile);

        // And removed from the as-yet unplayed set.
        assert.isFalse(tm.unplayed.has(tile));
        assert.equal(tm.unplayed.size, 55);

        let tile2 = tm.unplayed.values().next().value;

        assert.throws(() => {
            tm.playTile(tile2, origin);
        }, "No available play");

        assert.throws(() => {
            tm.playTile(tile2, new TilePos(10, 10));
        }, "No available play");
    });

    test('vertexValues', () => {
        let tm = new Triomino();
        let origin = new TilePos();

        assert.deepEqual(tm.vertexValues(origin), [undefined, undefined, undefined]);

        let tile = tm.unplayed.values().next().value;
        assert.equal(tm.playableRot(tile, origin), 0);

        tm.playTile(tile, origin);
        assert.deepEqual(tm.vertexValues(origin), [0, 0, 0]);
        let nextPos = new TilePos(0, 1);
        assert.deepEqual(tm.vertexValues(nextPos), [0, undefined, 0]);

        let tile2 = <Tile> tm.unplayed.values().next().value;
        assert.deepEqual(tile2.def, [0, 0, 1]);

        assert.equal(tm.playableRot(tile2, nextPos), 2);
        tm.playTile(tile2, nextPos);
        assert.deepEqual(tm.vertexValues(nextPos), [0, 1, 0]);
    })

    test('availablePositions', () => {
        let tm = new Triomino();
        let origin = new TilePos();
        let tile = tm.unplayed.values().next().value;

        assert.equal(tm.available.size, 1);
        assert.isTrue(tm.isPosAvailable(origin));

        tm.playTile(tile, origin);
        assert.equal(tm.available.size, 3);

        tile = tm.unplayed.values().next().value;
        tm.playTile(tile, new TilePos(0, 1));
        console.log('1');
        assert.equal(tm.available.size, 4);

        assert.isTrue(tm.board.has(origin));
        assert.isTrue(tm.board.has(new TilePos(0, 1)));
    });
});

suite('Tile', () => {
    test('constructor', () => {
        const t = new Tile([0, 0, 0]);
        assert.notEqual(t, undefined);
    })

    test('value type', () => {
        let t1 = new Tile([0, 0, 0]);
        let t2 = new Tile([0, 0, 0]);
        let t3 = new Tile([0, 0, 0], 1);
        assert.equal(t1, t2);
        assert.notEqual(t1, t3);
        let s: Set<Tile> = new Set();
        s.add(t1);
        assert.isTrue(s.has(t2));
    });

    test('key', () => {
        let t = new Tile([1, 2, 3]);
        assert.equal(t.key(), '<1, 2, 3>');
        t = t.rotateTo(1);
        assert.equal(t.key(), '<1, 2, 3>@1');
    });

    test('Vertices', () => {
        let t = new Tile([1, 2, 3]);
        let tZero = t;
        assert.equal(t.getValue(0), 1, '0');
        assert.equal(t.getValue(1), 2, '1');
        assert.equal(t.getValue(2), 3, '2');
        t = t.rotate(1);
        assert.equal(t.rot, 1);
        assert.equal(t.getValue(0), 3);
        t = t.rotate(1);
        assert.equal(t.rot, 2);
        assert.equal(t.getValue(0), 2);
        t = t.rotate(1);
        assert.equal(t.rot, 0);
        assert.equal(t, tZero);
    });

    test('toString', () => {
        let t = new Tile([1, 2, 3]);
        assert.equal(t.toString(), 'Tile<1, 2, 3>');
    })

    test('matchRotation', () => {
        let tests: {pattern: TileDef, rot: (Rotation | undefined)}[] = [
            {pattern: [1, 2, 3], rot: 0},
            {pattern: [3, 1, 2], rot: 1},
            {pattern: [2, 3, 1], rot: 2},
            {pattern: [1, 2, 2], rot: undefined},
        ]
        let t = new Tile([1, 2, 3]);

        for (let test of tests) {
            assert.equal(t.matchRotation(test.pattern), test.rot, `${test.pattern} => ${test.rot}`);
        }
    })
});

suite('Tile Position', () => {
    test('constructor', () => {
        let p = new TilePos();
        assert.equal(p.key(), '0, 0');

        p = new TilePos(1, 2);
        assert.equal(p.key(), '1, 2');
    })

    test('value type', () => {
        let p1 = new TilePos();
        let p2 = new TilePos(0, 0);
        let p3 = new TilePos(0, 1);
        assert.equal(p1, p2);
        assert.notEqual(p1, p3);
        let s: Set<TilePos> = new Set();
        s.add(p1);
        assert.isTrue(s.has(p2));
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
    })

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
    })
});

// Helper function - return true if all in Iterable are different.
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

function countIter(iter: Iterable<any>) {
    let count = 0;
    for (let i of iter) {
        count += 1;
    }
    return count;
}