import { suite, test } from 'mocha';
import { assert} from 'chai';
import { Triomino } from './triomino.js'


suite('Triomino', () => {

    test('constructor', () => {
        const tm = new Triomino();
        assert.notEqual(tm, undefined);
        assert.equal(tm.unplayed.length, 56);
    })

    test('tiles', () => {
        assert.equal(Triomino.includedTiles().length, 56);
        assert.equal(Triomino.missingTiles().length, 20);
        assert.equal(Triomino.allTiles().length, 76);
    });
});