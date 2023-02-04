import * as ttt from "./games/tictactoe.js";
import * as minimax from "../dist/index.js";

// Create a new game of ticatactoe and initialise
const game = new ttt.tictactoe();
game.start();

// Create a tree with a clone of the empty game at the root
const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
const tree = new minimax.Tree(root);
tree.CreateChildNode = ttt.createChildCallback;
tree.GetMoves = ttt.getMovesCallback;

// Time how long it takes to make a full tree
const now = Date.now();
tree.createFullTree();
const elapsed = Date.now() - now;

// Print results
console.log("Took %d seconds to find %d games", elapsed / 1000, tree.leafCount);
console.log("The tree has %d nodes", tree.nodeCount);
