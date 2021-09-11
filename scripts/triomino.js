export { Triomino, Tile };
class Triomino {
    constructor(tiles) {
        this.board = new Map();
        this.unplayed = new Array();
        if (tiles === undefined) {
            tiles = Triomino.includedTiles();
        }
        this.unplayed = tiles;
    }
    static includedTiles() {
        let result = [];
        for (let i = 0; i < 6; i++) {
            for (let j = i; j < 6; j++) {
                for (let k = j; k < 6; k++) {
                    result.push([i, j, k]);
                }
            }
        }
        return result;
    }
    static missingTiles() {
        let result = [];
        for (let i = 0; i < 6; i++) {
            for (let j = i + 2; j < 6; j++) {
                for (let k = i + 1; k < 6; k++) {
                    if (k < j) {
                        result.push([i, j, k]);
                    }
                }
            }
        }
        return result;
    }
    static allTiles() {
        return Triomino.includedTiles().concat(Triomino.missingTiles());
    }
}
class Tile {
}
//# sourceMappingURL=triomino.js.map