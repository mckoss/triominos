export { Triomino, Tile };
class Triomino {
    constructor(tiles = Triomino.includedTiles()) {
        this.board = new Map();
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));
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
            for (let j = (i + 2); j < 6; j++) {
                for (let k = (i + 1); k < 6; k++) {
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
    getBoard(pos) {
        return this.board.get(pos.key());
    }
    playTile(tile, pos, rot) {
        if (this.board.get(pos.key()) !== undefined) {
            throw Error("Cannot play ${tile} over ${this.board.get(pos)}.");
        }
        tile.rot = rot;
        this.board.set(pos.key(), tile);
        this.unplayed.delete(tile);
    }
}
class Tile {
    constructor(def) {
        this.rot = 0;
        this.def = def;
    }
    getValue(vert) {
        return this.def[(this.rot + vert) % 3];
    }
    toString() {
        return "Tile ${this.def.join(', ')}";
    }
}
class Position {
    constructor(x = 0, y = 0) {
        this.x = 0;
        this.y = 0;
    }
    key() {
        return `${this.x}-${this.y}`;
    }
}
//# sourceMappingURL=triomino.js.map