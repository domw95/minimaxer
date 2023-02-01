import * as mancala from "./games/mancala.js";
import * as minimax from "../dist/index.js";
import { options } from "yargs";

// Create game and start it
const game = new mancala.mancala();
game.start();
// Create root node
const root = new minimax.Node(minimax.NodeType.ROOT, game, 0, 0, minimax.NodeAim.MAX, game.moves);
// Create tree from root
const tree = new minimax.Negamax(root);
// Assign the callback
tree.CreateChildNode = mancala.createChildCallback;
// Choose the search depth and method
tree.opts.depth = 17;
tree.opts.method = minimax.SearchMethod.DEEPENING;
tree.opts.genBased = true;
tree.opts.pruning = minimax.PruningType.ALPHA_BETA;
tree.opts.presort = true;
// Run the search
const result = tree.evaluate();
console.log(result);
