// Check that the evaluations returned during a search hold true
// i.e that the minimum and maximum values for the respective players in x turns holds true.

import * as mancala from "../examples/games/mancala.js";
import * as minimax from "../dist/index.js";
import { SearchMethod } from "../dist/tree/search.js";

const depth = 8;

function callback(tree: minimax.Negamax<mancala.mancala, number, number>, result: minimax.NegamaxResult<number>) {
    // console.log(result);
}

const opts_list: minimax.NegamaxOpts[] = [];

// Depth search
let opts = new minimax.NegamaxOpts();
opts.method = SearchMethod.DEPTH;
opts_list.push(opts);

// Deepening
opts = new minimax.NegamaxOpts();
opts.method = SearchMethod.DEEPENING;
opts_list.push(opts);

// Deepening AB
opts = new minimax.NegamaxOpts();
opts.method = SearchMethod.DEEPENING;
opts.pruning = minimax.PruningType.ALPHA_BETA;
opts_list.push(opts);

// Deepening AB Presort
opts = new minimax.NegamaxOpts();
opts.method = SearchMethod.DEEPENING;
opts.pruning = minimax.PruningType.ALPHA_BETA;
opts.presort = true;
opts_list.push(opts);

test("Depth and deepening Search", () => {
    opts_list.forEach((opts) => {
        console.log(opts);

        for (let depth = 1; depth < 9; depth++) {
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
                const root = new minimax.Node(minimax.NodeType.ROOT, game, 0, 0, aim, game.moves);
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
        }
    });
});
