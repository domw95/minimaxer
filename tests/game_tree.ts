import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../dist/index.js";

const game = new ttt.tictactoe();
game.start();

// Create a tree with a clone of the empty game at the root
const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
const tree = new minimax.Tree(root);
tree.CreateChildNode = ttt.createChildCallback;
tree.EvaluateNode = ttt.evaluateGamestateCallback;
tree.GetMoves = ttt.getMovesCallback;

test("Construct TicTacToe game tree", () => {
    tree.createFullTree();
    expect(tree.leafCount).toBe(255168);
    expect(tree.nodeCount).toBe(549945);
});
