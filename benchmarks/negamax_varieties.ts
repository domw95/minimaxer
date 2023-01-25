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
    tree.evaluate();
}

suite(
    "Negamax varieties",

    add("Standard settings", () => {
        const opts = new minimax.NegamaxOpts();
        negamax(opts);
    }),
    add("Gen Based", () => {
        const opts = new minimax.NegamaxOpts();
        opts.genBased = true;
        negamax(opts);
    }),
    add("Presort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.presort = true;
        negamax(opts);
    }),
    add("Postsort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.postsort = true;
        negamax(opts);
    }),
    add("Alphabeta", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        negamax(opts);
    }),
    add("Alphabeta presort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.presort = true;
        negamax(opts);
    }),
    add("Alphabeta postsort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.postsort = true;
        negamax(opts);
    }),
    add("Alphabeta gen presort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.presort = true;
        opts.genBased = true;
        negamax(opts);
    }),
    add("Alphabeta gen postsort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.postsort = true;
        opts.genBased = true;
        negamax(opts);
    }),
    add("Alphabeta gen presort pathlength", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.presort = true;
        opts.genBased = true;
        opts.pruneByPathLength = true;
        negamax(opts);
    }),
    add("Optimal", () => {
        const opts = new minimax.NegamaxOpts();
        opts.optimal = true;
        // opts.pruning = minmax.PruningType.ALPHA_BETA;
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
