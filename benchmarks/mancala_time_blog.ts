/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";
import { add, complete, cycle, save, suite } from "benny";

const timeout = 10000;

function negamax(opts: minimax.NegamaxOpts): minimax.NegamaxResult<number> {
    // Create game and tree
    const game = new mancala.mancala();
    game.start();

    const root = new minimax.Node(minimax.NodeType.ROOT, game, 0, 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = mancala.createChildCallback;
    tree.opts.timeout = timeout;
    tree.opts.method = minimax.SearchMethod.TIME;
    return tree.evaluate();
}

console.log("\nStandard");
let opts = new minimax.NegamaxOpts();
console.log(negamax(opts));

console.log("\nAlpha-beta");
opts = new minimax.NegamaxOpts();
opts.pruning = minimax.PruningType.ALPHA_BETA;
console.log(negamax(opts));

console.log("\nAlpha-beta Presort");
opts = new minimax.NegamaxOpts();
opts.pruning = minimax.PruningType.ALPHA_BETA;
console.log(negamax(opts));
