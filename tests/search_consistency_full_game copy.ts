// Check that the evaluations returned during a search hold true
// i.e that the minimum and maximum values for the respective players in x turns holds true.

import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const DEPTH = 4;

// Create standard game with moves
const opts = new minimax.NegamaxOpts();
opts.method = SearchMethod.DEPTH;
opts.depth = DEPTH;
const game = new mancala.mancala();
game.enableDoubleMove = true;
game.start();

// Moves and evaluations
const results: minimax.NegamaxResult<number>[] = [];
const gamestates: mancala.mancala[] = [];
const aims: minimax.NodeAim[] = [];

let aim = minimax.NodeAim.MAX;
while (!game.end) {
    // Create root node
    const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), 0, 0, aim, game.moves);
    // Create tree
    const tree = new minimax.Negamax(root, opts);
    // Assign callback
    tree.CreateChildNode = mancala.createChildCallback;

    // Ger result
    const result = tree.evaluate();
    console.log(result);

    results.push(result);
    gamestates.push(game.clone());
    aims.push(aim);

    // Play move
    game.playMove(result.move);

    //  Prepare for next
    aim = -aim;
}

console.log(results.map((result) => result.value));

//  Runs against the gamestates generated above, checking for same evaluations
function compare_opts(opts: minimax.NegamaxOpts, check_move = true) {
    opts.depth = DEPTH;
    gamestates.forEach((gamestate, ind) => {
        // Create root node
        const root = new minimax.Node(minimax.NodeType.ROOT, gamestate.clone(), 0, 0, aims[ind], gamestate.moves);
        // Create tree
        const tree = new minimax.Negamax(root, opts);
        // Assign callback
        tree.CreateChildNode = mancala.createChildCallback;

        // Get result
        const result = tree.evaluate();

        // Check result
        expect(result.value).toBe(results[ind].value);
        if (check_move) {
            expect(result.move).toBe(results[ind].move);
            expect(result.pathLength).toBe(results[ind].pathLength);
        }
        // expect(result.exit).toBe(results[ind].exit);
    });
}

test("Depth", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    compare_opts(opts);
});

test("Depth Presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.presort = true;
    compare_opts(opts);
});

test("Depth genbased", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.genBased = true;
    compare_opts(opts);
});

test("Depth AB", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    compare_opts(opts);
});

test("Depth AB, Gen, Presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.genBased = true;
    compare_opts(opts);
});

test("Deepening", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    compare_opts(opts);
});

test("Deepening Presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.presort = true;
    compare_opts(opts, false);
});

test("Deepening Gen", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.genBased = true;
    compare_opts(opts);
});

test("Deepening AB", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    compare_opts(opts);
});

test("Deepening AB presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    compare_opts(opts, false);
});

test("Deepening AB presort gen", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.genBased = true;
    compare_opts(opts, false);
});

test("Deepening AB presort gen Bubble", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.sortMethod = minimax.SortMethod.BUBBLE;
    opts.genBased = true;
    compare_opts(opts, false);
});

test("Deepening AB presort gen Bubble Efficient", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.sortMethod = minimax.SortMethod.BUBBLE_EFFICIENT;
    opts.genBased = true;
    compare_opts(opts, false);
});
