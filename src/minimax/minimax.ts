import { SearchTree } from "../tree/searchtree.js";
import { MinimaxOpts } from "./index.js";
import { Node } from "../index.js";

/**
 * Interface for performing a minimax search
 */
class Minimax<GS, M, D> extends SearchTree<GS, M, D> {
    constructor(root: Node<GS, M, D>, opts = new MinimaxOpts()) {
        super(root, opts);
    }
}
