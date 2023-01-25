/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";
import { add, complete, cycle, save, suite } from "benny";

const depth = 5;

function negamax(opts: minimax.NegamaxOpts): void {
    // Create game and tree
    const game = new mancala.mancala();
    game.start();

    const root = new minimax.Node(minimax.NodeType.ROOT, game, 0, 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = mancala.createChildCallback;

    tree.opts.depth = depth;
    tree.opts.method = minimax.SearchMethod.DEEPENING;
    tree.opts.presort = true;

    tree.evaluate();
}

suite(
    "Sorting methods",

    add("Standard", () => {
        const opts = new minimax.NegamaxOpts();
        negamax(opts);
    }),
    add("Alphabeta", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        negamax(opts);
    }),
    add("Alphabeta Gen", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.presort = true;
        opts.genBased = true;
        negamax(opts);
    }),
    add("Alphabeta Bubble", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.sortMethod = minimax.SortMethod.BUBBLE;
        negamax(opts);
    }),
    add("Alphabeta Gen Bubble", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.presort = true;
        opts.genBased = true;
        opts.sortMethod = minimax.SortMethod.BUBBLE;
        negamax(opts);
    }),
    add("Alphabeta Bubble Efficient", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.sortMethod = minimax.SortMethod.BUBBLE_EFFICIENT;
        negamax(opts);
    }),
    add("Alphabeta Gen Bubble Efficient", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.presort = true;
        opts.genBased = true;
        opts.sortMethod = minimax.SortMethod.BUBBLE_EFFICIENT;
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
