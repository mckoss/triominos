export { Triomino, TileDef, Tile, Value, TilePos, VertexPos };

type Value = 0 | 1 | 2 | 3 | 4 | 5;

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

    constructor(tiles = Triomino.includedTiles()) {
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));
        this.available 

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

    canPlay(pos: TilePos): boolean {
        return this.available.has(pos.key());
    }

    playTile(tile: Tile, pos: TilePos, rot: Rotation) {
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