export { Triomino, TileDef, Tile, Value, TilePos, VertexPos, Rotation };

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

type TilePosKey = string;
type VertPosKey = string;

class Triomino {
    board: Map<TilePosKey, Tile> = new Map();
    unplayed: Set<Tile>;
    available: Map<TilePosKey, TilePos> = new Map();
    vertices: Map<VertPosKey, VertexInfo> = new Map();

    constructor(tiles = Triomino.includedTiles()) {
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));

        // The first tile must be played at the origin.
        let origin = new TilePos();
        this.available.set(origin.key(), origin);
    }

    static includedTiles() : TileDef[] {
        let result: TileDef[] = [];
        
        for (let i: Value = <Value> 0; i < 6; i++) {
            for (let j: Value = i; j < 6; j++) {
                for (let k: Value = j; k < 6; k++) {
                    result.push([i, j, k]);
                }
            }
        }
        return result;
    }

    static missingTiles() : TileDef[] {
        let result: TileDef[] = [];

        for (let i: Value = <Value> 0; i < 6; i++) {
            for (let j: Value = <Value> (i + 2); j < 6; j++) {
                for (let k: Value = <Value> (i + 1); k < 6; k++) {
                    if (k < j) {
                        result.push([i, j, k]);
                    }
                }
            }
        }

        return result;
    }

    static allTiles() : TileDef[] {
        return Triomino.includedTiles().concat(Triomino.missingTiles());
    }

    getTile(pos: TilePos): Tile | undefined {
        return this.board.get(pos.key());
    }

    isPosAvailable(pos: TilePos): boolean {
        return this.available.has(pos.key());
    }

    vertexValues(pos: TilePos) : (Value | undefined)[] {
        return Array.from(pos.getVertices()).map(vpos => this.vertices.get(vpos.key())?.value);
    }

    // If tile is playable at a position, return the
    // rotation needed.
    canPlay(tile: Tile, pos: TilePos): Rotation | undefined {
        if (!this.unplayed.has(tile)) {
            throw("Playable tiles must come from the unplayed set.");
        }

        if (!this.isPosAvailable(pos)) {
            return undefined;
        }

        return tile.matchRotation(this.vertexValues(pos));
    }

    playTile(tile: Tile, pos: TilePos) {
        // There are never two distinct rotations for playing a tile
        // except the trivial case of all values equal.  So
        // determine the rotation to use when playing a tile.
        let rot = this.canPlay(tile, pos);
        if (rot === undefined) {
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

        // Update the vertex info
        let i: Vertex = 0;
        for (let vpos of pos.getVertices()) {
            let info = this.vertices.get(vpos.key());
            if (info === undefined) {
                this.vertices.set(vpos.key(), new VertexInfo(tile.getValue(i)));
            } else {
                info.count += 1;
            }
            i = <Vertex> (i + 1);
        }
    }
}

class Tile {
    def: TileDef;
    rot: Rotation = 0;

    constructor(def: TileDef) {
        this.def = def;
    }

    getValue(vert: Vertex) : Value {
        return this.def[(vert - this.rot + 3) % 3];
    }

    toString() : string {
        return `Tile<${this.def.join(', ')}>`;
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

class TilePos {
    x: number;
    y: number;

    constructor(x = 0, y= 0) {
        this.x = x;
        this.y = y;
    }

    key() : TilePosKey {
        return `${this.x}, ${this.y}`;
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
}