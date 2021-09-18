export { Triomino, TileDef, Tile, Value, TilePos, VertexPos, Rotation };
import { cloneMap, cloneSet } from './clone-utils.js';
import { iwrap, product, range, xrange, power } from './iter-wrapper.js';

type Value = 0 | 1 | 2 | 3 | 4 | 5;

// Tiles are oriented so the values are
// defined as lower-left, top, and lower right
// (i.e. clockwise around the tile).
type TileDef = [Value, Value, Value];

// Tiles in the 0 orientation are listed as left, top, right values.
// The others are clockwise rotations of those numbers.
type Rotation = 0 | 1 | 2;

// The names of the positions of the triangle (left, top, right).
type Vertex = 0 | 1 | 2;

type VertPosKey = string;

class Triomino {
    board: Map<TilePos, Tile> = new Map();
    unplayed: Set<Tile>;
    available: Set<TilePos> = new Set();
    vertices: Map<VertPosKey, VertexInfo> = new Map();

    constructor(tiles = Triomino.includedTiles()) {
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));

        // The first tile must be played at the origin.
        let origin = new TilePos();
        this.available.add(origin);
    }

    static includedTiles() : TileDef[] {
        return iwrap(power(xrange(6), 3))
            .filter(([a, b, c]) => a <= b && b <= c)
            .array() as TileDef[];
    }

    static missingTiles() : TileDef[] {
        return iwrap(power(xrange(6), 3))
            .filter(([a, b, c]) => b > a && c > a && c < b)
            .array() as TileDef[];
    }

    static allTiles() : TileDef[] {
        return Triomino.includedTiles().concat(Triomino.missingTiles());
    }

    clone(): Triomino {
        let tm = new Triomino([]);
        tm.board = new Map(this.board);
        tm.unplayed = new Set(this.unplayed);
        tm.available = new Set(this.available);
        tm.vertices = cloneMap(this.vertices);
        return tm;
    }

    getTile(pos: TilePos): Tile | undefined {
        return this.board.get(pos);
    }

    isPosAvailable(pos: TilePos): boolean {
        return this.available.has(pos);
    }

    vertexValues(pos: TilePos) : (Value | undefined)[] {
        return Array.from(pos.getVertices()).map(vpos => this.vertices.get(vpos.key())?.value);
    }

    // If tile is playable at a position, return the
    // rotation needed.
    playableRot(tile: Tile, pos: TilePos): Rotation | undefined {
        if (!this.unplayed.has(tile)) {
            throw("Playable tiles must come from the unplayed set.");
        }

        if (!this.isPosAvailable(pos)) {
            return undefined;
        }

        return tile.matchRotation(this.vertexValues(pos));
    }

    *playableTiles(): Generator<Tile> {
        for (let tile of this.unplayed) {
            for (let pos of this.available.values()) {
                if (this.playableRot(tile, pos) !== undefined) {
                    yield tile;
                    break;
                }
            }
        }
    }

    playTile(tile: Tile, pos: TilePos) {
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
        let i: Vertex = 0;
        for (let vpos of pos.getVertices()) {
            let info = this.vertices.get(vpos.key());
            if (info === undefined) {
                this.vertices.set(vpos.key(), new VertexInfo(rotatedTile.getValue(i)));
            } else {
                info.count += 1;
            }
            i = <Vertex> (i + 1);
        }
    }
}

// The Tile class returns IMMUTABLE objects.  Further, these
// can be used as VALUE types; two tiles constructed from
// the same parameters will return IDENTICAL objects.
// This means they can be placed in Set's and used
// as keys in Maps.

type TileKey = string;
const canonicalTiles: Map<TileKey, Tile> = new Map();

class Tile {
    readonly def: TileDef;
    readonly rot: Rotation;

    constructor(def: TileDef, rot: Rotation = 0) {
        this.def = def;
        this.rot = <Rotation> (rot % 3);
        if (canonicalTiles.has(this.key())) {
            return canonicalTiles.get(this.key())!;
        }
        canonicalTiles.set(this.key(), this);
    }

    key(): TileKey {
        return `<${this.def.join(', ')}>${this.rot !== 0 ? '@' + this.rot : ''}`;
    }

    getValue(vert: Vertex) : Value {
        return this.def[(vert - this.rot + 3) % 3];
    }

    toString() : string {
        return `Tile${this.key()}`;
    }

    rotateTo(rot: Rotation): Tile {
        return new Tile(this.def, rot);
    }

    rotate(rot: Rotation): Tile {
        return this.rotateTo(<Rotation> (this.rot + rot));
    }

    // Determine the (clockwise) rotation of a tile to match the given
    // values.
    matchRotation(values: (Value | undefined)[]) : (Rotation | undefined) {
        rotloop:
        for (let rot: Rotation = 0; rot < 3; rot++) {
            for (let i: Vertex = 0; i < 3; i++) {
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

// TilePos is also an immutable value type.

type TilePosKey = string;
const canonicalTilePos: Map<TilePosKey, TilePos> = new Map();

class TilePos {
    x: number;
    y: number;

    constructor(x = 0, y= 0) {
        this.x = x;
        this.y = y;
        if (canonicalTilePos.has(this.key())) {
            return canonicalTilePos.get(this.key())!;
        }
        canonicalTilePos.set(this.key(), this);
    }

    key() : TilePosKey {
        return `${this.x}, ${this.y}`;
    }

    toString(): string {
        return `(${this.key()})`;
    }

    *adjacentPositions(): Generator<TilePos> {
        let rel = [[0, 1], [0, -1]];
        if (this.y % 2 === 0) {
            rel.push([-1, 1]);
        } else {
            rel.push([1, -1]);
        }
        for (let r of rel) {
            yield new TilePos(this.x + r[0], this.y + r[1]);
        }
    }

    *getVertices() : Generator<VertexPos> {
        let rel: [number, number][];

        let base = [this.x, Math.floor(this.y / 2)];

        if (this.y % 2 === 0) {
            rel = [[0, 0], [0, 1], [1, 0]];
        } else {
            rel = [[0, 1], [1, 1], [1, 0]];
        }
        
        for (let r of rel) {
            yield new VertexPos(this.x + r[0], Math.floor(this.y / 2) + r[1]);
        }
    }
}

class VertexPos {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    key() : VertPosKey {
        return `V${this.x}, ${this.y}`;
    }
}

class VertexInfo {
    value: Value;
    count = 1;

    constructor(value: Value) {
        this.value = value;
    }

    clone(): VertexInfo {
        let result = new VertexInfo(this.value);
        result.count = this.count;
        return result;
    }
}