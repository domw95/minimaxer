import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../dist/index.js";

const game = new ttt.tictactoe();
game.start();

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
    expect(result.value).toBe(0);
    expect(result.depth).toBe(9);
    expect(result.outcomes).toBe(255168);
    expect(result.nodes).toBe(549945);
    expect(elapsed).toBeLessThan(3.5);
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
    expect(result.value).toBe(0);
    expect(result.depth).toBe(9);
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
    console.log(result);
    console.log("Took ", elapsed, " Seconds");
    expect(result.value).toBe(0);
    expect(result.depth).toBe(9);
    expect(elapsed).toBeLessThan(0.2);
});
