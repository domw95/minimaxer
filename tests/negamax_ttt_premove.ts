import * as ttt from "../examples/games/tictactoe.js";
import * as minimax from "../dist/index.js";

const game = new ttt.tictactoe();
game.start();
game.state[0][0] = ttt.CellType.CIRCLE;
game.generateMoves();

// Test full tree search for a few algorithms

test("Standard negamax evaluation", () => {
    const tree = new minimax.Negamax<ttt.tictactoe, number[]>(
        game.clone(),
        minimax.NodeAim.MAX,
        ttt.getMovesCallback,
        ttt.createChildCallback,
        ttt.evaluateGamestateCallback,
    );
    tree.opts.timeout = 5000;
    const now = Date.now();
    const result = tree.evalTime();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.6);
});

test("Alphabeta pruning", () => {
    const tree = new minimax.Negamax<ttt.tictactoe, number[]>(
        game.clone(),
        minimax.NodeAim.MAX,
        ttt.getMovesCallback,
        ttt.createChildCallback,
        ttt.evaluateGamestateCallback,
    );
    tree.opts.timeout = 5000;
    tree.opts.pruning = minimax.PruningType.ALPHA_BETA;
    const now = Date.now();
    const result = tree.evalTime();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.3);
});

test("Alphabeta pruning, genbased and presort", () => {
    const tree = new minimax.Negamax<ttt.tictactoe, number[]>(
        game.clone(),
        minimax.NodeAim.MAX,
        ttt.getMovesCallback,
        ttt.createChildCallback,
        ttt.evaluateGamestateCallback,
    );
    tree.opts.timeout = 5000;
    tree.opts.pruning = minimax.PruningType.ALPHA_BETA;
    tree.opts.genBased = true;
    tree.opts.presort = true;
    const now = Date.now();
    const result = tree.evalTime();
    const elapsed = (Date.now() - now) / 1000;
    expect(result.value).toBe(1);
    expect(result.depth).toBe(8);
    expect(elapsed).toBeLessThan(0.2);
});
