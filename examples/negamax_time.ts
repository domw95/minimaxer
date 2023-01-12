import * as mancala from "../examples/games/mancala.js";
import * as minmax from "../dist/index.js";

const depthCallback = (tree: minmax.Negamax<mancala.mancala, number>, result: minmax.NegamaxResult<number>): void => {
    // console.log("Depth: %d, Move:%d", result.depth, result.move);
    console.log("Depth: \t", result.depth, "\t Moves", JSON.stringify(tree.getOptimalMoves()));
};

function negamax(opts: minmax.NegamaxOpts): void {
    // Create game and tree
    const game = new mancala.mancala();
    game.enableDoubleMove = true;
    game.start();
    // game.playMove(2);
    // game.playMove(-1);

    const tree = new minmax.Negamax(
        game,
        minmax.NodeAim.MAX,
        mancala.getMovesCallback,
        mancala.createChildCallback,
        mancala.evaluateNodeCallback,
        opts,
    );
    tree.depthCallback = depthCallback;
    const result = tree.evalTime();
    console.log(result);
    console.log("Memory: ", process.memoryUsage()["heapTotal"] / 1e6, " MB");
}

// Standard time search
let opts = new minmax.NegamaxOpts();
opts.timeout = 20000;
console.log("Standard search");
negamax(opts);

// Alphabeta search
opts.pruning = minmax.PruningType.ALPHA_BETA;
console.log("\nAlphabeta search");
negamax(opts);

// Alphabeta presort
opts.presort = true;
console.log("\nAlphabeta presort search");
negamax(opts);

// Alphabeta presort genbased
opts.genBased = true;
console.log("\nAlphabeta genbased presort search");
negamax(opts);
