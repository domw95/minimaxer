/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as mancala from "../examples/games/mancala.js";
import * as minmax from "../dist/index.js";
import { add, complete, cycle, save, suite } from "benny";

const depth = 5;

function negamax(opts: minmax.NegamaxOpts): void {
    // Create game and tree
    const game = new mancala.mancala();
    game.start();

    const tree = new minmax.Negamax(game, minmax.NodeAim.MAX, game.moves, opts);
    tree.CreateChildNode = mancala.createChildCallback;
    tree.opts.depth = depth;
    tree.opts.method = minmax.SearchMethod.DEEPENING;
    tree.evaluate();
}

suite(
    "Negamax varieties",

    add("Standard settings", () => {
        const opts = new minmax.NegamaxOpts();
        negamax(opts);
    }),
    add("Gen Based", () => {
        const opts = new minmax.NegamaxOpts();
        opts.genBased = true;
        negamax(opts);
    }),
    add("Alphabeta", () => {
        const opts = new minmax.NegamaxOpts();
        opts.pruning = minmax.PruningType.ALPHA_BETA;
        negamax(opts);
    }),
    add("Alphabeta presort", () => {
        const opts = new minmax.NegamaxOpts();
        opts.pruning = minmax.PruningType.ALPHA_BETA;
        opts.presort = true;
        negamax(opts);
    }),
    add("Alphabeta postsort", () => {
        const opts = new minmax.NegamaxOpts();
        opts.pruning = minmax.PruningType.ALPHA_BETA;
        opts.postsort = true;
        negamax(opts);
    }),
    add("Alphabeta gen presort", () => {
        const opts = new minmax.NegamaxOpts();
        opts.pruning = minmax.PruningType.ALPHA_BETA;
        opts.presort = true;
        opts.genBased = true;
        negamax(opts);
    }),
    add("Alphabeta gen postsort", () => {
        const opts = new minmax.NegamaxOpts();
        opts.pruning = minmax.PruningType.ALPHA_BETA;
        opts.postsort = true;
        opts.genBased = true;
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
