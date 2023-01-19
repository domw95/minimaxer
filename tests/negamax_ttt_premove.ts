import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../dist/index.js";

const game = new ttt.tictactoe();
game.start();
game.state[0][0] = ttt.CellType.CIRCLE;
game.generateMoves();

// Test full tree search for a few algorithms

test("Standard negamax evaluation", () => {
    const tree = new minimax.Negamax(game.clone(), minimax.NodeAim.MAX, new minimax.NegamaxOpts(), game.moves);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    tree.opts.timeout = 5000;

    const now = Date.now();
    const result = tree.evalTime();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.6);
});

test("Alphabeta pruning", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.pruning = minimax.PruningType.ALPHA_BETA;

    const tree = new minimax.Negamax(game.clone(), minimax.NodeAim.MAX, opts, game.moves);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    const now = Date.now();
    const result = tree.evalTime();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.3);
});

test("Alphabeta pruning, genbased and presort", () => {
    const opts = new minimax.NegamaxOpts();
    opts.timeout = 5000;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.presort = true;

    const tree = new minimax.Negamax(game.clone(), minimax.NodeAim.MAX, opts, game.moves);
    tree.CreateChildNode = ttt.createChildCallback;
    tree.EvaluateNode = ttt.evaluateGamestateCallback;
    tree.GetMoves = ttt.getMovesCallback;

    const now = Date.now();
    const result = tree.evalTime();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.2);
});
