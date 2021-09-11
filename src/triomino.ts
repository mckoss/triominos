export { Triomino, TileDef, Tile, Value };

type Value = 0 | 1 | 2 | 3 | 4 | 5;

type TileDef = [Value, Value, Value];

// Tiles in the 0 orientation are listed as left, top, right values.
// The others are clockwise rotations of those numbers.
type Rotation = 0 | 1 | 2;

// The names of the positions of the triangle (left, top, right).
type Vertex = 0 | 1 | 2;

type PositionKey = string;

class Triomino {
    board: Map<string, Tile> = new Map();
    unplayed: Set<Tile>;

    constructor(tiles = Triomino.includedTiles()) {
        this.unplayed = new Set(tiles.map((def) => new Tile(def)));
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

    getBoard(pos: Position): Tile | undefined {
        return this.board.get(pos.key());
    }

    playTile(tile: Tile, pos: Position, rot: Rotation) {
        if (this.board.get(pos.key()) !== undefined) {
            throw Error("Cannot play ${tile} over ${this.board.get(pos)}.")
        }
        tile.rot = rot;
        this.board.set(pos.key(), tile);
        this.unplayed.delete(tile);
    }
}

class Tile {
    def: TileDef;
    rot: Rotation = 0;

    constructor(def: TileDef) {
        this.def = def;
    }

    getValue(vert: Vertex) : Value {
        return this.def[(this.rot + vert) % 3];
    }

    toString() : string {
        return "Tile ${this.def.join(', ')}";
    }
}

class Position {
    x: number;
    y: number;

    constructor(x = 0, y= 0) {
        this.x = 0;
        this.y = 0;
    }

    key() : PositionKey {
        return `${this.x}-${this.y}`;
    }
}