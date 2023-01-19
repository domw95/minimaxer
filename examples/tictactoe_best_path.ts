import * as ttt from "./games/tictactoe.js";
import * as minimax from "../dist/index.js";

// Create a new game of ticatactoe and initialise
const game = new ttt.tictactoe();
game.start();
game.state[2][1] = ttt.CellType.CIRCLE;
game.generateMoves();

const opts = new minimax.NegamaxOpts();
opts.pruning = minimax.PruningType.ALPHA_BETA;
opts.timeout = 1000;
let aim = minimax.NodeAim.MAX;
while (!game.end) {
    // Create a tree with a clone of the empty game at the root

    const tree = new minimax.Negamax(game.clone(), aim, game.moves, opts);

    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;
    const result = tree.evalTime();
    console.log(result);
    game.playMove(result.move);
    console.log(game.state);

    aim = -aim;
}
