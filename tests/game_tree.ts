import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../src/index.js";

const game = new ttt.tictactoe();
game.start();
const tree = new minimax.Tree<ttt.tictactoe, number[]>(
    game.clone(),
    minimax.NodeAim.MAX,
    ttt.getMovesCallback,
    ttt.createChildCallback,
    ttt.evaluateGamestateCallback,
);

test("Construct TicTacToe game tree", () => {
    tree.createFullTree();
    expect(tree.leafCount).toBe(255168);
    expect(tree.nodeCount).toBe(549945);
});
