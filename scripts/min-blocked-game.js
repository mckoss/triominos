import { Triomino, TilePos } from './triomino.js';
// Search for the minimum number of tiles that can be played
// such that there are NO more plays possible.
//
// Use a greedy approach to play tiles that have a minimum of possible
// successive plays, until the number of possible remaining plays is empty.
function findMinBlocked(tm) {
    // play 0, 0, 0, first (other values have different size solutions!)
    let first = tm.unplayed.values().next().value;
    let origin = new TilePos();
    tm.playTile(first, origin);
    console.log(`1. Play ${first} at ${origin} (for (${countIter(tm.playableTiles())} playable tiles.)`);
    let playNum = 2;
    while (true) {
        let best;
        let bestCount;
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
                        best = [tile, pos];
                    }
                }
            }
        }
        console.log(`${playNum++}. Play ${best[0]} at ${best[1]} (for ${bestCount} playable tiles)`);
        tm.playTile(best[0], best[1]);
        if (bestCount === 0) {
            break;
        }
    }
}
let tm = new Triomino();
findMinBlocked(tm);
function countIter(iter) {
    let count = 0;
    for (let i of iter) {
        count += 1;
    }
    return count;
}
//# sourceMappingURL=min-blocked-game.js.map