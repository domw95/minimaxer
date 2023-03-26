import * as mancala from "../examples/games/mancala.js";
import * as mx from "../dist/index.js";
import { validateDescendants } from "../dist/tree/utils.js";

test("Remove every depth", () => {
    for (let depth = 1; depth <= 8; depth++) {
        const game = new mancala.mancala();
        game.start();

        // Standard search
        let root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
        let tree = new mx.Negamax(root);
        tree.CreateChildNode = mancala.createChildCallback;
        tree.opts.optimal = true;
        tree.opts.method = mx.SearchMethod.DEEPENING;
        tree.opts.depth = depth;

        let result = tree.evaluate();
        validateDescendants(tree.root);
        expect(tree.nodeCount).toBe(tree.root.descendantCount + 1);

        // Removal search
        root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
        tree = new mx.Negamax(root);
        tree.CreateChildNode = mancala.createChildCallback;
        tree.opts.optimal = true;
        tree.opts.method = mx.SearchMethod.DEEPENING;
        tree.opts.depth = depth;
        tree.opts.removalMethod = mx.RemovalMethod.ALWAYS;

        let result2 = tree.evaluate();

        expect(result2.move).toBe(result.move);
        expect(result2.value).toBe(result.value);
        validateDescendants(tree.root);
        expect(tree.nodeCount).toBe(tree.root.descendantCount + 1);
    }
});
