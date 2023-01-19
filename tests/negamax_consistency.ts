// Test to check that all forms of search return the same result

import * as mancala from "../examples/games/mancala.js";
import * as minmax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

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
    tree.evaluate();
    // console.log(result);
    // console.log("Memory: ", process.memoryUsage()["heapTotal"] / 1e6, " MB");
    return tree.getOptimalMoves();
}

test("Search consistency", () => {
    // Standard time search
    const opts = new minmax.NegamaxOpts();
    opts.depth = depth;
    opts.method = SearchMethod.DEEPENING;
    console.log("Standard search");
    const moves = negamax(opts);
    console.log(moves);

    // Alphabeta search
    opts.pruning = minmax.PruningType.ALPHA_BETA;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with presort
    opts.presort = true;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with postsort
    opts.presort = false;
    opts.postsort = true;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with postsort and gen
    opts.genBased = true;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with postsort and gen
    opts.presort = true;
    opts.postsort = false;
    expect(negamax(opts)).toEqual(moves);

    // Alphabeta with postsort and gen
    opts.pruneByPathLength = true;
    expect(negamax(opts)).toEqual(moves);
});
