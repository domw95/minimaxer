import * as mancala from "../examples/games/mancala.js";
import * as mx from "../dist/index.js";

test("Node removal", () => {
    const game = new mancala.mancala();
    game.start();
    let root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
    let tree = new mx.Negamax(root);
    tree.CreateChildNode = mancala.createChildCallback;

    tree.opts.depth = 8;
    let now = performance.now();
    tree.opts.method = mx.SearchMethod.DEEPENING;
    const result = tree.evaluate();
    console.log("Search took: %d", performance.now() - now);
    console.log(result);

    now = performance.now();
    tree.removeNodes();
    console.log("Removal took: %d", performance.now() - now);
    console.log("%d Nodes remaining", tree.nodeCount);
});
