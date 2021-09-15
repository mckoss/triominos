export { Triomino, Tile, TilePos, VertexPos };
class Triomino {
    constructor(tiles = Triomino.includedTiles()) {
        this.board = new Map();
        this.available = new Map();
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));
        this.available;
        let origin = new TilePos();
        this.available.set(origin.key(), origin);
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
    getTile(pos) {
        return this.board.get(pos.key());
    }
    canPlay(pos) {
        return this.available.has(pos.key());
    }
    playTile(tile, pos, rot) {
        if (!this.canPlay(pos)) {
            throw Error("No available play for ${tile} at ${pos}.");
        }
        tile.rot = rot;
        this.board.set(pos.key(), tile);
        this.unplayed.delete(tile);
        this.available.delete(pos.key());
        // Add any adjacent unoccupied board positions to the available
        // position set.
        for (let posT of pos.adjacentPositions()) {
            if (this.getTile(posT) === undefined) {
                this.available.set(posT.key(), posT);
            }
        }
    }
}
class Tile {
    constructor(def) {
        this.rot = 0;
        this.def = def;
    }
    getValue(vert) {
        return this.def[(vert - this.rot + 3) % 3];
    }
    toString() {
        return `Tile<${this.def.join(', ')}>`;
    }
}
class TilePos {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    key() {
        return `${this.x}, ${this.y}`;
    }
    *adjacentPositions() {
        let rel = [[0, 1], [0, -1]];
        if (this.y % 2 === 0) {
            rel.push([-1, 1]);
        }
        else {
            rel.push([1, -1]);
        }
        for (let r of rel) {
            yield new TilePos(this.x + r[0], this.y + r[1]);
        }
    }
    *getVertices() {
        let rel;
        let base = [this.x, Math.floor(this.y / 2)];
        if (this.y % 2 === 0) {
            rel = [[0, 0], [0, 1], [1, 0]];
        }
        else {
            rel = [[0, 1], [1, 1], [1, 0]];
        }
        for (let r of rel) {
            yield new VertexPos(this.x + r[0], Math.floor(this.y / 2) + r[1]);
        }
    }
}
class VertexPos {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    key() {
        return `V${this.x}, ${this.y}`;
    }
}
//# sourceMappingURL=triomino.js.map