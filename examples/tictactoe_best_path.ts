import * as ttt from "./games/tictactoe.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

// Create a new game of ticatactoe and initialise
const game = new ttt.tictactoe();
game.start();
game.state[2][1] = ttt.CellType.CIRCLE;
game.generateMoves();

const opts = new minimax.NegamaxOpts();
opts.pruning = minimax.PruningType.ALPHA_BETA;
opts.timeout = 1000;
opts.pruneByPathLength = true;
opts.method = SearchMethod.TIME;
let aim = minimax.NodeAim.MAX;
while (!game.end) {
    // Create a tree with a clone of the empty game at the root

    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    const result = tree.evaluate();
    console.log(result);
    game.playMove(result.move);
    console.log(game.state);

    aim = -aim;
}
