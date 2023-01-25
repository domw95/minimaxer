// Check that the evaluations returned during a search hold true
// i.e that the minimum and maximum values for the respective players in x turns holds true.

import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const depth = 8;

function callback(tree: minimax.Negamax<mancala.mancala, number, number>, result: minimax.NegamaxResult<number>) {
    // console.log(result);
}

function run_searches(max_depth: number, opts: minimax.NegamaxOpts) {
    console.log(opts);

    for (let depth = 1; depth < max_depth + 1; depth++) {
        // Create game and start it
        opts.depth = depth;
        const game = new mancala.mancala();
        game.enableDoubleMove = true;
        game.start();

        // Predicitions
        const minimums: number[] = [];
        const maximums: number[] = [];
        let turn = 0;

        console.log("Depth", depth);

        let aim = minimax.NodeAim.MAX;
        while (!game.end) {
            // Create root node
            const root = new minimax.Node(minimax.NodeType.ROOT, game.clone(), 0, 0, aim, game.moves);
            // Create tree
            const tree = new minimax.Negamax(root, opts);
            // Assign callback
            tree.CreateChildNode = mancala.createChildCallback;
            tree.depthCallback = callback;

            // Ger result
            const result = tree.evaluate();
            const prediction = result.value;
            // console.log(result);

            // Update predicitions
            if (result.exit == minimax.SearchExit.FULL_DEPTH) {
                if (aim == minimax.NodeAim.MAX) {
                    minimums.push(prediction);
                } else {
                    maximums.push(prediction);
                }
            }

            // Play move
            game.playMove(result.move);
            turn++;

            //  Prepare for next
            aim = -aim;
        }
        // Check predicitions
        const value = game.ends[0] - game.ends[1];
        minimums.forEach((minimum) => {
            expect(value).toBeGreaterThanOrEqual(minimum);
        });
        maximums.forEach((maximum) => {
            expect(value).toBeLessThanOrEqual(maximum);
        });
        console.log("Final Value", value);
    }
}

test("Depth", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    run_searches(6, opts);
});

test("Depth Presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.presort = true;
    run_searches(6, opts);
});

test("Depth genbased", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.genBased = true;
    run_searches(6, opts);
});

test("Depth Postsort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.postsort = true;
    run_searches(6, opts);
});

test("Depth AB", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    run_searches(6, opts);
});

test("Depth pathlength", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.pruneByPathLength = true;
    run_searches(6, opts);
});

test("Depth AB, Gen, Presort, Postsort, pathlength", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.postsort = true;
    opts.genBased = true;
    opts.pruneByPathLength = true;
    run_searches(6, opts);
});

test("Depth optimal", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEPTH;
    opts.optimal = true;
    run_searches(8, opts);
});

test("Deepening", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    run_searches(6, opts);
});

test("Deepening Presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.presort = true;
    run_searches(6, opts);
});

test("Deepening Gen", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.genBased = true;
    run_searches(6, opts);
});

test("Deepening Postsort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.postsort = true;
    run_searches(6, opts);
});

test("Deepening AB", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    run_searches(8, opts);
});

test("Deepening pathlength", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruneByPathLength = true;
    run_searches(6, opts);
});

test("Deepening AB presort", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    run_searches(8, opts);
});

test("Deepening AB presort postsort gen", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.postsort = true;
    opts.genBased = true;
    run_searches(8, opts);
});

test("Deepening AB presort postsort gen pathlength", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.pruning = minimax.PruningType.ALPHA_BETA;
    opts.presort = true;
    opts.postsort = true;
    opts.genBased = true;
    opts.pruneByPathLength = true;
    run_searches(8, opts);
});

test("Deepening optimal", () => {
    // Depth search
    const opts = new minimax.NegamaxOpts();
    opts.method = SearchMethod.DEEPENING;
    opts.optimal = true;
    run_searches(8, opts);
});
