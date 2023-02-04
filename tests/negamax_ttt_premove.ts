import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const game = new ttt.tictactoe();
game.start();
// Place tile in centre of top row
// Slow win should take 7 more moves, fast win should take 8
game.state[0][1] = ttt.CellType.CIRCLE;
game.generateMoves();

// Test full tree search for a few algorithms

test("Standard negamax evaluation", () => {
    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    tree.opts.timeout = 5000;
    tree.opts.pruneByPathLength = true;
    tree.opts.method = SearchMethod.TIME;

    const now = Date.now();
    const result = tree.evaluate();
    const elapsed = (Date.now() - now) / 1000;
    console.log(result);
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.6);
    expect(result.pathLength).toBe(5);
});

test("Alphabeta pruning", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.pruneByPathLength = true;
    opts.method = SearchMethod.TIME;

    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    // const now = Date.now();
    const result = tree.evaluate();
    // const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(result.pathLength).toBe(5);
});

test("Alphabeta pruning, genbased and presort", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.presort = true;
    opts.pruneByPathLength = true;
    opts.method = SearchMethod.TIME;

    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), [0, 0], 0, minimax.NodeAim.MAX, game.moves);
    const tree = new minimax.Negamax(root, opts);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    const now = Date.now();
    const result = tree.evaluate();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.2);
    expect(result.pathLength).toBe(5);
});
