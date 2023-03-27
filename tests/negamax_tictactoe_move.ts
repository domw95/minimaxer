import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const game = new ttt.tictactoe();
game.start();

// Test full tree search for a few algorithms

test("Standard negamax evaluation", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.method = SearchMethod.TIME;

    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    // const now = Date.now();
    const result = tree.evaluate();
    // const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(0);
    expect(result.depth).toBe(9);
    expect(result.outcomes).toBe(255168);
    expect(result.nodes).toBe(549946);
});

test("Alphabeta pruning", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.method = SearchMethod.TIME;

    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    // const now = Date.now();
    const result = tree.evaluate();
    // const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(0);
    expect(result.depth).toBe(9);
});

test("Alphabeta pruning, genbased and presort", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.method = SearchMethod.TIME;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.presort = true;

    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    // const now = Date.now();
    const result = tree.evaluate();
    // const elapsed = (Date.now() - now) / 1000;
    // console.log(result);
    // console.log("Took ", elapsed, " Seconds");
    expect(result.value).toBe(0);
    expect(result.depth).toBe(9);
});
