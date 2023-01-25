// The following search methods should all have the same result when used with presort
// Deepening, AB on/off, genbased on/off

import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";

const DEPTH = 5;

// Create standard game with moves
const opts = new minimax.NegamaxOpts();
opts.method = minimax.SearchMethod.DEEPENING;
opts.depth = DEPTH;
opts.presort = true;

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
function compare_opts(opts: minimax.NegamaxOpts) {
    opts.depth = DEPTH;
    opts.method = minimax.SearchMethod.DEEPENING;
    opts.presort = true;
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
        expect(result.move).toBe(results[ind].move);
        expect(result.pathLength).toBe(results[ind].pathLength);
        // expect(result.exit).toBe(results[ind].exit);
    });
}

test("Gen based", () => {
    const opts = new minimax.NegamaxOpts();
    opts.genBased = true;
    compare_opts(opts);
});

test("AB pruning", () => {
    const opts = new minimax.NegamaxOpts();
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    compare_opts(opts);
});

test("Gen + AB pruning", () => {
    const opts = new minimax.NegamaxOpts();
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.genBased = true;
    compare_opts(opts);
});

test("Gen based Bubble", () => {
    const opts = new minimax.NegamaxOpts();
    opts.genBased = true;
    opts.sortMethod = minimax.SortMethod.BUBBLE;
    compare_opts(opts);
});

test("AB pruning Bubble", () => {
    const opts = new minimax.NegamaxOpts();
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.sortMethod = minimax.SortMethod.BUBBLE;
    compare_opts(opts);
});

test("Gen + AB pruning Bubble", () => {
    const opts = new minimax.NegamaxOpts();
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.sortMethod = minimax.SortMethod.BUBBLE;
    compare_opts(opts);
});

test("Gen based Bubble Efficient", () => {
    const opts = new minimax.NegamaxOpts();
    opts.genBased = true;
    opts.sortMethod = minimax.SortMethod.BUBBLE_EFFICIENT;
    compare_opts(opts);
});

test("AB pruning Bubble Efficient", () => {
    const opts = new minimax.NegamaxOpts();
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.sortMethod = minimax.SortMethod.BUBBLE_EFFICIENT;
    compare_opts(opts);
});

test("Gen + AB pruning Bubble Efficient", () => {
    const opts = new minimax.NegamaxOpts();
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.genBased = true;
    opts.sortMethod = minimax.SortMethod.BUBBLE_EFFICIENT;
    compare_opts(opts);
});
