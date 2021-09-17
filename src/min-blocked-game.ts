import { Triomino, Tile, Value, TilePos, VertexPos, TileDef, Rotation } from './triomino.js'

// Search for the minimum number of tiles that can be played
// such that there are NO more plays possible.
//
// Use a greedy approach to play tiles that have a minimum of possible
// successive plays, until the number of possible remaining plays is empty.
function findMinBlocked(tm: Triomino, startTile: Tile) {
    // play 0, 0, 0, first (other values have different size solutions!)
    let origin = new TilePos();
    tm.playTile(startTile, origin);
    console.log(`1. Play ${startTile} at ${origin} (for (${countIter(tm.playableTiles())} playable tiles.)`);

    let playNum = 2;

    while (true) {
        let best: undefined | [Tile, TilePos, Tile[]];
        let bestCount: undefined | number;

        // Also try each tile at all the available positions
        // Note that enumerating over iterators while modifying
        // the underlying Map is not supported.
        for (let tile of tm.playableTiles()) {
            // console.log(`${tile} over ${Array.from(tm.available.values())}`);
            for (let pos of tm.available.values()) {
                let tmChild = tm.clone();
                if (tmChild.playableRot(tile, pos) !== undefined) {
                    tmChild.playTile(tile, pos);
                    let count = countIter(tmChild.playableTiles());
                    if (bestCount === undefined || count < bestCount) {
                        // console.log(`Found candidate ${tile} at ${pos} (${count})`);
                        bestCount = count;
                        best = [tile, pos, Array.from(tmChild.playableTiles())];
                    }
                }
            }
        }
        console.log(`${playNum++}. Play ${best![0]} at ${best![1]} (for ${bestCount} playable tiles)`);
        if (bestCount !== undefined && bestCount < 10) {
            console.log(`    ${best![2].join(', ')}`);
        }
        tm.playTile(best![0], best![1]);
        if (bestCount === 0) {
            break;
        }
    }
    console.log();
}

for (let v: Value = 0; v < 6; v = <Value> (v + 1)) {
    findMinBlocked(new Triomino(), new Tile([v, v, v]));
}

let fullTiles = Triomino.includedTiles().concat(Triomino.missingTiles());

for (let v: Value = 0; v < 6; v = <Value> (v + 1)) {
    findMinBlocked(new Triomino(fullTiles), new Tile([v, v, v]));
}

function countIter(iter: Iterable<any>) {
    let count = 0;
    for (let i of iter) {
        count += 1;
    }
    return count;
}