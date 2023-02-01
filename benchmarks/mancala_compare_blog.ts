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
    tree.evaluate();
}

suite(
    "Mancala benchmark for blog",

    add("Standard settings", () => {
        const opts = new minimax.NegamaxOpts();
        opts.method = minimax.SearchMethod.DEPTH;
        negamax(opts);
    }),

    add("Alphabeta", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.method = minimax.SearchMethod.DEPTH;
        negamax(opts);
    }),
    add("Standard deepening", () => {
        const opts = new minimax.NegamaxOpts();
        opts.method = minimax.SearchMethod.DEEPENING;
        negamax(opts);
    }),
    add("Alphabeta Deepening", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.method = minimax.SearchMethod.DEEPENING;
        negamax(opts);
    }),
    add("Alphabeta Deepening Presort", () => {
        const opts = new minimax.NegamaxOpts();
        opts.pruning = minimax.PruningType.ALPHA_BETA;
        opts.method = minimax.SearchMethod.DEEPENING;
        opts.presort = true;
        negamax(opts);
    }),

    cycle(),
    cycle(),
    cycle(),

    complete(),
);
