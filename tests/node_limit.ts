import * as mancala from "../examples/games/mancala.js";
import * as mx from "../dist/index.js";

test("Node limit negamax", () => {
    const game = new mancala.mancala();
    game.start();
    const root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
    const tree = new mx.Negamax(root);
    tree.CreateChildNode = mancala.createChildCallback;

    const NODE_LIMIT = Math.floor(1000 + 1000 * Math.random());
    tree.opts.nodeLimit = NODE_LIMIT;
    tree.opts.depth = 5;
    tree.opts.method = mx.SearchMethod.DEEPENING;
    const result = tree.evaluate();
    expect(result.nodes).toBeLessThanOrEqual(NODE_LIMIT + 6);
});
