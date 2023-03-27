import * as mancala from "../examples/games/mancala.js";
import * as mx from "../dist/index.js";
import { validateDescendants } from "../dist/tree/utils.js";

test("Check node counts", () => {
    const game = new mancala.mancala();
    game.start();
    const root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
    const tree = new mx.Negamax(root);
    tree.CreateChildNode = mancala.createChildCallback;

    tree.opts.depth = 5;
    tree.opts.method = mx.SearchMethod.DEEPENING;
    tree.evaluate();
    expect(validateDescendants(tree.root)).toBe(tree.nodeCount);
});

test("Check node counts Negamax optimal", () => {
    const game = new mancala.mancala();
    game.start();
    const root = new mx.Node(mx.NodeType.ROOT, game.clone(), 0, 0, mx.NodeAim.MAX, game.moves);
    const tree = new mx.Negamax(root);
    tree.CreateChildNode = mancala.createChildCallback;

    tree.opts.depth = 5;
    tree.opts.method = mx.SearchMethod.DEEPENING;
    tree.opts.optimal = true;
    const result = tree.evaluate();
    expect(validateDescendants(tree.root)).toBe(tree.nodeCount);
    console.log(result);
});
