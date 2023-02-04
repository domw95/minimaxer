/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as mancala from "../examples/games/mancala.js";
import * as mx from "../dist/index.js";
import { add, complete, cycle, save, suite } from "benny";

const depth = 5;

function negamax(opts: mx.NegamaxOpts): void {
    // Create game and tree
    const game = new mancala.mancala();
    game.start();

    const root = new mx.Node(mx.NodeType.ROOT, game, 0, 0, mx.NodeAim.MAX, game.moves);
    const tree = new mx.Negamax(root, opts);
    tree.CreateChildNode = mancala.createChildCallback;
    tree.opts.depth = depth;
    tree.opts.method = mx.SearchMethod.DEEPENING;
    tree.evaluate();
}

function minimax(opts: mx.MinimaxOpts): void {
    // Create game and tree
    const game = new mancala.mancala();
    game.start();

    const root = new mx.Node(mx.NodeType.ROOT, game, 0, 0, mx.NodeAim.MAX, game.moves);
    const tree = new mx.Minimax(root, opts);
    tree.CreateChildNode = mancala.createChildCallback;
    tree.opts.depth = depth;
    tree.opts.method = mx.SearchMethod.DEEPENING;
    tree.evaluate();
}

suite(
    "Negamax varieties",

    add("Negamax", () => {
        const opts = new mx.NegamaxOpts();
        negamax(opts);
    }),
    add("Minimax", () => {
        const opts = new mx.MinimaxOpts();
        minimax(opts);
    }),
    add("Negamax Gen", () => {
        const opts = new mx.NegamaxOpts();
        opts.genBased = true;
        negamax(opts);
    }),
    add("Minimax Gen", () => {
        const opts = new mx.MinimaxOpts();
        opts.genBased = true;
        minimax(opts);
    }),
    add("Negamax Alphabeta", () => {
        const opts = new mx.NegamaxOpts();
        opts.pruning = mx.PruningType.ALPHA_BETA;
        negamax(opts);
    }),
    add("Minimax Alphabeta", () => {
        const opts = new mx.MinimaxOpts();
        opts.pruning = mx.PruningType.ALPHA_BETA;
        minimax(opts);
    }),

    add("Negamax Alphabeta presort", () => {
        const opts = new mx.NegamaxOpts();
        opts.pruning = mx.PruningType.ALPHA_BETA;
        opts.presort = true;
        negamax(opts);
    }),
    add("Minimax Alphabeta presort", () => {
        const opts = new mx.MinimaxOpts();
        opts.pruning = mx.PruningType.ALPHA_BETA;
        opts.presort = true;
        minimax(opts);
    }),
    add("Negamax Alphabeta presort gen", () => {
        const opts = new mx.NegamaxOpts();
        opts.pruning = mx.PruningType.ALPHA_BETA;
        opts.genBased = true;
        opts.presort = true;
        negamax(opts);
    }),
    add("Minimax Alphabeta presort gen", () => {
        const opts = new mx.MinimaxOpts();
        opts.pruning = mx.PruningType.ALPHA_BETA;
        opts.genBased = true;
        opts.presort = true;
        minimax(opts);
    }),
    // add("Alphabeta gen presort pathlength", () => {
    //     const opts = new mx.NegamaxOpts();
    //     opts.pruning = mx.PruningType.ALPHA_BETA;
    //     opts.presort = true;
    //     opts.genBased = true;
    //     opts.pruneByPathLength = true;
    //     negamax(opts);
    // }),
    add("Negamax Optimal", () => {
        const opts = new mx.NegamaxOpts();
        opts.optimal = true;
        negamax(opts);
    }),

    cycle(),
    cycle(),
    cycle(),

    complete(),

    save({
        file: "negamax_unify_" + depth.toString() + "_depth",
        folder: "benchmarks/results",
    }),
);
