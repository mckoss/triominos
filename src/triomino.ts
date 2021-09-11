export { Triomino, TileDef, Tile };

type TileDef = [number, number, number];

class Triomino {
    board: Map<[number, number], Tile> = new Map();
    unplayed: Tile[] = new Array();

    constructor(tiles?: TileDef[]) {
        if (tiles === undefined) {
            tiles = Triomino.includedTiles();
        }
        this.unplayed = tiles;
    }

    static includedTiles() : TileDef[] {
        let result: TileDef[] = [];
        
        for (let i = 0; i < 6; i++) {
            for (let j = i; j < 6; j++) {
                for (let k = j; k < 6; k++) {
                    result.push([i, j, k]);
                }
            }
        }
        return result;
    }

    static missingTiles() : TileDef[] {
        let result: TileDef[] = [];

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

    static allTiles() : TileDef[] {
        return Triomino.includedTiles().concat(Triomino.missingTiles());
    }
}

class Tile {

}