import { MinimaxResult, Node, NodeType, SearchExit } from "../index.js";
import { GetScoresFunc } from "../tree/interfaces.js";
import { SearchTree } from "../tree/searchtree.js";
import { MaxnOpts } from "./index.js";

/**
 * Interface for performing a minimax search
 */
export class Maxn<GS, M, D> extends SearchTree<GS, M, D> {
    /**
     *
     * @param root Root node to start the tree from
     * @param opts Optional options to configure the minimax algorithm
     */
    constructor(root: Node<GS, M, D>, opts = new MaxnOpts()) {
        super(root, opts);
    }

    getScores: GetScoresFunc<GS, M, D> = () => {
        throw Error("getScores not implemented");
    };

    protected evalDepth(depth = this.opts.depth): MinimaxResult<M> {
        // reset stats
        this.outcomes = 0;
        this.activeDepth = depth;
        // reset fullDepth flag
        this.fullDepth = true;
        // Call negamax to depth
        const exit = this.maxn(this.activeRoot, depth);
        // return result
        return new MinimaxResult<M>(
            exit,
            this.activeRoot.child?.move as M,
            this.activeRoot.inheritedValue,
            depth,
            this.outcomes,
            this.nodeCount,
            this.activeRoot.pathLength,
        );
    }

    /**
     * Implements the negamax algorithm up to a given depth of search.
     * Recursively calls itself until `depth` is `0` or {@link NodeType.LEAF} node is reached and evaluated.
     * Node values are then passed back up the tree according to the {@link NodeAim} of the parent nodes.
     *
     * The `colour` arguments alternates between `1` and `-1`, as the node aim alternates between {@link NodeAim.MAX} and {@link NodeAim.MIN}.
     * This changes the sign of the value applied to node depending on the aim of the parent.
     * Selection of the best child can then be done based on the maximum node value.
     *
     * Returns early if timeout occurs
     *
     * @param node Node to evaluate or search children
     * @param depth Depth to search from this node
     * @param colour `1` for {@link NodeAim.MAX}, `-1` for {@link NodeAim.MIN}
     * @param alpha minimum guaranteed score
     * @param alpha_path Best guaranteed path
     * @param beta maximum guaranteed score from minimising player
     * @param beta_path Best guaranteed path for minimising player
     * @returns `false` if time expired during search, `true` if search should continue
     */
    protected maxn(node: Node<GS, M, D>, depth: number): SearchExit {
        // Check if this node should be assigned a direct value
        if (node.type == NodeType.LEAF) {
            return this.assignNodeValue(node, true);
        } else if (depth == 0) {
            return this.assignNodeValue(node, false);
        } else {
            // Check expiry
            if (this.checkExpiry()) {
                return SearchExit.TIME;
            }

            let exit = SearchExit.FULL_DEPTH;
            let best: Node<GS, M, D> | undefined;
            // Iterate through node children
            for (const child of this.getChildren(node)) {
                exit = this.maxn(child, depth - 1);
                if (exit == SearchExit.TIME) {
                    return SearchExit.TIME;
                }

                // Assign a value according to this nodes player
                child.inheritedValue = child.inheritedScores[node.activePlayer];

                if (best == undefined || child.inheritedValue > best.inheritedValue) {
                    best = child;
                }
            }
            // Assign the best child
            if (best) {
                node.child = best;
                node.inheritedScores = best.inheritedScores;
                node.inheritedValue = best.inheritedValue;
                node.inheritedDepth = this.activeDepth;
                node.pathLength = best.pathLength + 1;
            }
            return exit;
        }
    }

    protected assignNodeValue(node: Node<GS, M, D>, leaf: boolean) {
        // Fetch the node scores if they havent already been assigned
        if (!node.scores.length) {
            this.getScores(node);
        }
        // Set nodes values as the score of its parent player
        node.inheritedValue = node.scores[node.parent?.activePlayer as number];
        node.inheritedDepth = this.activeDepth;
        // tally
        this.outcomes++;
        if (leaf) {
            node.pathLength = 0;
            return this.fullDepth ? SearchExit.FULL_DEPTH : SearchExit.DEPTH;
        } else {
            node.pathLength = 1;
            this.fullDepth = false;
            return SearchExit.DEPTH;
        }
    }
}
