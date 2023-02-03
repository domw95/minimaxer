// Test to check that all forms of search return the same result

import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const depth = 8;

// Runs negamax to depth, returns array of best moves
function negamax(opts: minimax.NegamaxOpts): number[] {
    // Create game and tree
    const game = new mancala.mancala();
    // game.enableDoubleMove = true;
    game.start();
    // game.playMove(2);
    // game.playMove(-1);

    // Create root node
    const root = new minimax.Node(minimax.NodeType.ROOT, game, 0, 0, minimax.NodeAim.MAX, game.moves);
    // Create tree
    const tree = new minimax.Negamax(root, opts);
    // Assigb callback
    tree.CreateChildNode = mancala.createChildCallback;
    // Evaluate tree
    tree.evaluate();
    // console.log(result);
    // console.log("Memory: ", process.memoryUsage()["heapTotal"] / 1e6, " MB");
    return tree.getOptimalMoves();
}

test("Search consistency", () => {
    // Standard time search
    const opts = new minimax.NegamaxOpts();
    opts.depth = depth;
    opts.method = SearchMethod.DEEPENING;
    console.log("Standard search");
    const moves = negamax(opts);
    console.log(moves);

    // Alphabeta search
    opts.pruning = minimax.PruningType.ALPHA_BETA;
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
