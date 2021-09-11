import { suite, test } from 'mocha';
import { assert} from 'chai';
import { Triomino, Tile, Value } from './triomino.js'


suite('Triomino', () => {

    test('constructor', () => {
        const tm = new Triomino();
        assert.notEqual(tm, undefined);
        assert.equal(tm.unplayed.size, 56);
        console.log(tm.unplayed);
    })

    test('tiles', () => {
        assert.equal(Triomino.includedTiles().length, 56);
        assert.equal(Triomino.missingTiles().length, 20);
        assert.equal(Triomino.allTiles().length, 76);
    });
});

suite('Tile', () => {
    test('constructor', () => {
        const t = new Tile([0, 0, 0]);
        assert.notEqual(t, undefined);
    })
});