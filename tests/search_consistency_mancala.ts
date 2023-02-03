// Test to check that all forms of search return the same result

import * as mancala from "../examples/games/mancala.js";
import * as mx from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const depth = 8;

// Runs negamax to depth, returns array of best moves
function negamax(opts: mx.NegamaxOpts): number[] {
    // Create game and tree
    const game = new mancala.mancala();
    // game.enableDoubleMove = true;
    game.start();
    // game.playMove(2);
    // game.playMove(-1);

    // Create root node
    const root = new mx.Node(mx.NodeType.ROOT, game, 0, 0, mx.NodeAim.MAX, game.moves);
    // Create tree
    const tree = new mx.Negamax(root, opts);
    tree.opts.depth = depth;
    // Assigb callback
    tree.CreateChildNode = mancala.createChildCallback;
    // Evaluate tree
    tree.evaluate();
    // console.log(result);
    // console.log("Memory: ", process.memoryUsage()["heapTotal"] / 1e6, " MB");
    return tree.getOptimalMoves();
}

function minimax(opts: mx.MinimaxOpts): number[] {
    // Create game and tree
    const game = new mancala.mancala();
    game.start();

    const root = new mx.Node(mx.NodeType.ROOT, game, 0, 0, mx.NodeAim.MAX, game.moves);
    const tree = new mx.Minimax(root, opts);
    tree.CreateChildNode = mancala.createChildCallback;
    tree.opts.depth = depth;
    tree.evaluate();
    return tree.getOptimalMoves();
}

// Calculate standard moves
const opts = new mx.NegamaxOpts();
opts.depth = depth;
opts.method = SearchMethod.DEPTH;
console.log("Standard search");
const moves = negamax(opts);
console.log(moves);

test("Alpha beta", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta presort", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.presort = true;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta gen", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.genBased = true;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta gen presort", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.presort = true;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta Deepening", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.method = SearchMethod.DEEPENING;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta presort Deepening", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.method = SearchMethod.DEEPENING;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta gen Deepening", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.method = SearchMethod.DEEPENING;
    expect(negamax(opts)).toEqual(moves);
});

test("Alpha beta gen presort Deepening", () => {
    const opts = new mx.NegamaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.presort = true;
    opts.method = SearchMethod.DEEPENING;
    expect(negamax(opts)).toEqual(moves);
});

test("Minimax", () => {
    const opts = new mx.MinimaxOpts();
    expect(minimax(opts)).toEqual(moves);
});

test("Minimax alpha-beta", () => {
    const opts = new mx.MinimaxOpts();
    opts.pruning = mx.PruningType.ALPHA_BETA;
    expect(minimax(opts)).toEqual(moves);
});
