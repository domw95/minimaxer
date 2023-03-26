import * as mancala from "./games/mancala.js";
import * as mx from "../dist/index.js";

// Create game and initialise it
const game = new mancala.mancala();
game.start();

// Perform a search to depth 4
console.log("Search 1: Depth 4\n");
let root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
let tree = new mx.Negamax(root);
tree.CreateChildNode = mancala.createChildCallback;
tree.opts.depth = 4;
tree.opts.method = mx.SearchMethod.DEPTH;
console.log(tree.evaluate());

// Perform a search deepening with alpha-beta pruning to depth 4, printing the result at each depth
console.log("\nSearch 2: Deepening with depth callback\n");
root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
tree = new mx.Negamax(root);
tree.CreateChildNode = mancala.createChildCallback;
tree.opts.depth = 4;
tree.opts.method = mx.SearchMethod.DEEPENING;
tree.depthCallback = (tree, result) => {
    console.log(result);
};
console.log(tree.evaluate());

// Perform a time limited optimal search
console.log("\nSearch 3: Optimal Time\n");
root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
tree = new mx.Negamax(root);
tree.CreateChildNode = mancala.createChildCallback;
tree.opts.timeout = 100;
tree.opts.optimal;
tree.opts.method = mx.SearchMethod.TIME;
console.log(tree.evaluate());

// Select randomly from the best moves
console.log("\nSearch 4: Random best selectiom\n");
root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
tree = new mx.Negamax(root);
tree.CreateChildNode = mancala.createChildCallback;
tree.opts.depth = 2;
tree.opts.randomBest = true;
tree.opts.method = mx.SearchMethod.DEPTH;
console.log(tree.evaluate());

// Remove nodes after each depth when node count >= 1000
console.log("\nSearch 5: Node removal\n");
root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
tree = new mx.Negamax(root);
tree.CreateChildNode = mancala.createChildCallback;
tree.opts.depth = 8;
tree.opts.optimal = true;
tree.opts.method = mx.SearchMethod.DEEPENING;
tree.opts.removalMethod = mx.RemovalMethod.COUNT;
tree.opts.removalCount = 1000;
console.log(tree.evaluate());
