/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";

const depth = 4;

// Create game and tree
const game = new mancala.mancala();
game.start();

const root = new minimax.Node(minimax.NodeType.ROOT, game, 0, 0, minimax.NodeAim.MAX, game.moves);
const tree = new minimax.Negamax(root);
tree.CreateChildNode = mancala.createChildCallback;
tree.opts.depth = depth;
tree.opts.method = minimax.SearchMethod.DEEPENING;
// tree.opts.pruning = minimax.PruningType.ALPHA_BETA;
tree.depthCallback = (tree, result) => {
    console.log(result);
};
console.log(tree.evaluate());
