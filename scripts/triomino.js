export { Triomino, Tile, TilePos, VertexPos };
import { cloneMap } from './clone-utils.js';
import { iwrap, product, range, xrange, power } from './iter-wrapper.js';
class Triomino {
    constructor(tiles = Triomino.includedTiles()) {
        this.board = new Map();
        this.available = new Set();
        this.vertices = new Map();
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));
        // The first tile must be played at the origin.
        let origin = new TilePos();
        this.available.add(origin);
    }
    static includedTiles() {
        return iwrap(power(xrange(6), 3))
            .filter(([a, b, c]) => a <= b && b <= c)
            .array();
    }
    static missingTiles() {
        return iwrap(product(range(6), xrange(6), xrange(6)))
            .filter(([a, b, c]) => b > a && c > a && c < b)
            .array();
    }
    static allTiles() {
        return Triomino.includedTiles().concat(Triomino.missingTiles());
    }
    clone() {
        let tm = new Triomino([]);
        tm.board = new Map(this.board);
        tm.unplayed = new Set(this.unplayed);
        tm.available = new Set(this.available);
        tm.vertices = cloneMap(this.vertices);
        return tm;
    }
    getTile(pos) {
        return this.board.get(pos);
    }
    isPosAvailable(pos) {
        return this.available.has(pos);
    }
    vertexValues(pos) {
        return Array.from(pos.getVertices()).map(vpos => { var _a; return (_a = this.vertices.get(vpos.key())) === null || _a === void 0 ? void 0 : _a.value; });
    }
    // If tile is playable at a position, return the
    // rotation needed.
    playableRot(tile, pos) {
        if (!this.unplayed.has(tile)) {
            throw ("Playable tiles must come from the unplayed set.");
        }
        if (!this.isPosAvailable(pos)) {
            return undefined;
        }
        return tile.matchRotation(this.vertexValues(pos));
    }
    *playableTiles() {
        for (let tile of this.unplayed) {
            for (let pos of this.available.values()) {
                if (this.playableRot(tile, pos) !== undefined) {
                    yield tile;
                    break;
                }
            }
        }
    }
    playTile(tile, pos) {
        // There are never two distinct rotations for playing a tile
        // except the trivial case of all values equal.  So
        // determine the rotation to use when playing a tile.
        let rot = this.playableRot(tile, pos);
        if (rot === undefined) {
            throw Error(`No available play for ${tile} at ${pos}.`);
        }
        const rotatedTile = tile.rotateTo(rot);
        this.board.set(pos, rotatedTile);
        this.unplayed.delete(tile);
        this.available.delete(pos);
        // Add any adjacent unoccupied board positions to the available
        // position set.
        for (let posT of pos.adjacentPositions()) {
            if (this.getTile(posT) === undefined) {
                this.available.add(posT);
            }
        }
        // Update the vertex info
        let i = 0;
        for (let vpos of pos.getVertices()) {
            let info = this.vertices.get(vpos.key());
            if (info === undefined) {
                this.vertices.set(vpos.key(), new VertexInfo(rotatedTile.getValue(i)));
            }
            else {
                info.count += 1;
            }
            i = (i + 1);
        }
    }
}
const canonicalTiles = new Map();
class Tile {
    constructor(def, rot = 0) {
        this.def = def;
        this.rot = (rot % 3);
        if (canonicalTiles.has(this.key())) {
            return canonicalTiles.get(this.key());
        }
        canonicalTiles.set(this.key(), this);
    }
    key() {
        return `<${this.def.join(', ')}>${this.rot !== 0 ? '@' + this.rot : ''}`;
    }
    getValue(vert) {
        return this.def[(vert - this.rot + 3) % 3];
    }
    toString() {
        return `Tile${this.key()}`;
    }
    rotateTo(rot) {
        return new Tile(this.def, rot);
    }
    rotate(rot) {
        return this.rotateTo((this.rot + rot));
    }
    // Determine the (clockwise) rotation of a tile to match the given
    // values.
    matchRotation(values) {
        rotloop: for (let rot = 0; rot < 3; rot++) {
            for (let i = 0; i < 3; i++) {
                if (values[i] === undefined) {
                    continue;
                }
                if (values[i] !== this.def[(i - rot + 3) % 3]) {
                    continue rotloop;
                }
            }
            return rot;
        }
        return undefined;
    }
}
const canonicalTilePos = new Map();
class TilePos {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        if (canonicalTilePos.has(this.key())) {
            return canonicalTilePos.get(this.key());
        }
        canonicalTilePos.set(this.key(), this);
    }
    key() {
        return `${this.x}, ${this.y}`;
    }
    toString() {
        return `(${this.key()})`;
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
class VertexInfo {
    constructor(value) {
        this.count = 1;
        this.value = value;
    }
    clone() {
        let result = new VertexInfo(this.value);
        result.count = this.count;
        return result;
    }
}
//# sourceMappingURL=triomino.js.map