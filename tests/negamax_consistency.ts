// Test to check that all forms of search return the same result

import * as mancala from "../examples/games/mancala.js";
import * as minmax from "../dist/index.js";

const depth = 8;

// Runs negamax to depth, returns array of best moves
function negamax(opts: minmax.NegamaxOpts): number[] {
    // Create game and tree
    const game = new mancala.mancala();
    game.enableDoubleMove = true;
    game.start();
    // game.playMove(2);
    // game.playMove(-1);

    const tree = new minmax.Negamax(game, minmax.NodeAim.MAX, game.moves, opts);
    tree.CreateChildNode = mancala.createChildCallback;
    tree.evalDeepening();
    // console.log(result);
    // console.log("Memory: ", process.memoryUsage()["heapTotal"] / 1e6, " MB");
    return tree.getOptimalMoves();
}

test("Search consistency", () => {
    // Standard time search
    const opts = new minmax.NegamaxOpts();
    opts.depth = depth;
    console.log("Standard search");
    const moves = negamax(opts);
    console.log(moves);

    // Alphabeta search
    opts.pruning = minmax.PruningType.ALPHA_BETA;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with presort
    opts.presort = true;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with presort and gen
    opts.genBased = true;
    expect(negamax(opts)).toEqual(moves);
});
