import { Node, NodeType, SearchExit } from "../index.js";
import { GetScoresFunc } from "../tree/interfaces.js";
import { SearchTree } from "../tree/searchtree.js";
import { MaxnOpts, MaxnResult } from "./index.js";

/**
 * @alpha
 * Interface for performing a maxn search,
 * which can deal with games with an number of players.
 *
 * **Experimental, under development and undocumented**.
 *
 * @typeParam GS - The object representing the state of the game
 * @typeParam M - The object representing a move in the game
 * @typeParam D - Extra data used in evaluation not suitable for storing in the gamestate
 * @category Maxn
 */
export class Maxn<GS, M, D> extends SearchTree<GS, M, D> {
    /**
     *
     * @param root Root node to start the tree from
     * @param opts Optional options to configure the maxn algorithm
     */
    constructor(root: Node<GS, M, D>, opts = new MaxnOpts()) {
        super(root, opts);
    }

    /**
     * Callback for getting all the score attached to the node.
     */
    getScores: GetScoresFunc<GS, M, D> = () => {
        throw Error("getScores not implemented");
    };

    /**
     *
     * @param depth Overwrite the {@link MaxnOpts.depth} option.
     * @returns
     */
    protected evalDepth(depth = this.opts.depth): MaxnResult<M> {
        // reset stats
        this.outcomes = 0;
        this.activeDepth = depth;
        // reset fullDepth flag
        this.fullDepth = true;
        // Call negamax to depth
        const exit = this.maxn(this.activeRoot, depth);
        // Default best is the one assigned to root
        let best = this.activeRoot.child as Node<GS, M, D>;

        // Select random best if enabled
        if (this.opts.randomBest && exit != SearchExit.TIME) {
            // Get randomly selected best move
            best = this.randomBestChild(this.activeRoot);
        } else if (this.opts.randomWeight && exit != SearchExit.TIME) {
            // Get weighted random best move
            best = this.randomWeightedChild(this.activeRoot, this.opts.randomWeight);
        }
        // return result
        return new MaxnResult<M>(
            exit,
            best.move,
            best.inheritedValue,
            depth,
            this.outcomes,
            this.nodeCount,
            this.activeRoot.pathLength,
        );
    }

    /**
     * Implements the negamax algorithm up to a given depth of search.
     * Recursively calls itself until `depth` is `0` or {@link NodeType.LEAF}
     * node is reached and evaluated.
     *
     * @param node Node to evaluate or search children
     * @param depth Depth to search from this node
     * @returns reason for concluded the search
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
                child.inheritedDepth = this.activeDepth;

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

    /**
     *
     * @param node node to assign values to
     * @param leaf
     * @returns
     */
    protected assignNodeValue(node: Node<GS, M, D>, leaf: boolean) {
        // Fetch the node scores if they havent already been assigned
        if (!node.scores.length) {
            this.getScores(node);
        }
        node.inheritedDepth = this.activeDepth;
        node.inheritedScores = node.scores;
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
