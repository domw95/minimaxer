import { SearchTree } from "../tree/searchtree.js";
import { MinimaxOpts, MinimaxResult } from "./index.js";
import { Node, NodeAim, NodeType, PruningType, SearchExit } from "../index.js";

/**
 * Class for performing a minimax search.
 *
 * **Probability based searches coming soon**
 *
 * ## Usage
 * See the {@link Negamax} documentation for general usage, its is very similar.
 *
 * The differences are as follows:
 * - The {@link NegamaxOpts.optimal} flag is not supported (and won't be)
 * - The {@link MinimaxOpts.pruneByPathLength}, {@link MinimaxOpts.randomBest} and
 * {@link MinimaxOpts.randomWeight} options are not yet available.
 * - In the {@link Minimax.CreateChildNode} callback, the {@link NodeAim} must be
 * explicitly set according to the players turn. This allows repeated turns, i.e setting it as {@link NodeAim.MAX}
 * two turns in a row.
 *
 *
 * @typeParam GS - The object representing the state of the game
 * @typeParam M - The object representing a move in the game
 * @typeParam D - Extra data used in evaluation not suitable for storing in the gamestate
 */
export class Minimax<GS, M, D> extends SearchTree<GS, M, D> {
    /**
     *
     * @param root Root node to start the tree from
     * @param opts Optional options to configure the minimax algorithm
     */
    constructor(root: Node<GS, M, D>, opts = new MinimaxOpts()) {
        super(root, opts);
    }

    /**
     *
     * @param depth Overide the depth property in {@link Minimax.opts.depth}
     * @returns The result of the search
     */
    protected evalDepth(depth = this.opts.depth): MinimaxResult<M> {
        // reset stats
        this.outcomes = 0;
        this.activeDepth = depth;
        // reset fullDepth flag
        this.fullDepth = true;
        // Call negamax to depth
        const exit = this.minimax(this.activeRoot, depth, -Infinity, Infinity);
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
     * Implements the minimax algorithm up to a given depth of search.
     * Recursively calls itself until `depth` is `0` or {@link NodeType.LEAF}
     * node is reached and evaluated.
     *
     * Node values and best child are chosen according to the
     * {@link NodeAim} of the parent nodes.
     *
     * Returns early if timeout occurs
     *
     * @param node Node to evaluate or search children
     * @param depth Depth to search from this node
     * @param alpha minimum guaranteed score
     * @param beta maximum guaranteed score from minimising player
     * @returns Reason for returning.
     */
    protected minimax(node: Node<GS, M, D>, depth: number, alpha: number, beta: number): SearchExit {
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

            let result: { exit: SearchExit; best: Node<GS, M, D> | undefined } = {
                exit: SearchExit.FULL_DEPTH,
                best: undefined,
            };
            switch (this.opts.pruning) {
                case PruningType.NONE:
                    switch (node.aim) {
                        case NodeAim.MAX:
                            result = this.maximumBestChild(node, depth);
                            break;
                        case NodeAim.MIN:
                            result = this.minimumBestChild(node, depth);
                            break;
                    }
                    break;

                case PruningType.ALPHA_BETA:
                    result = this.alphaBetaBestChild(node, depth, alpha, beta);
                    break;
            }

            if (result.exit == SearchExit.TIME) {
                return SearchExit.TIME;
            }
            // Assign the best child (and postsort if enabled)
            if (result.best) {
                node.child = result.best;
                node.inheritedValue = result.best.inheritedValue;
                node.inheritedDepth = this.activeDepth;
                node.pathLength = result.best.pathLength + 1;
            }
            return result.exit;
        }
    }

    /**
     *  Goes through all of nodes children to find child with
     *  minimum inherited value
     */
    protected minimumBestChild(
        node: Node<GS, M, D>,
        depth: number,
    ): { exit: SearchExit; best: Node<GS, M, D> | undefined } {
        let exit = SearchExit.FULL_DEPTH;
        let best: Node<GS, M, D> | undefined;
        // Iterate through node children
        for (const child of this.getChildren(node)) {
            exit = this.minimax(child, depth - 1, -Infinity, Infinity);
            if (exit == SearchExit.TIME) {
                return { exit: SearchExit.TIME, best: best };
            }
            if (best == undefined || child.inheritedValue < best.inheritedValue) {
                best = child;
            }
        }
        return { exit: exit, best: best };
    }

    /**
     *  Goes through all of nodes children to find child with
     *  minimum inherited value
     */
    protected maximumBestChild(
        node: Node<GS, M, D>,
        depth: number,
    ): { exit: SearchExit; best: Node<GS, M, D> | undefined } {
        let exit = SearchExit.FULL_DEPTH;
        let best: Node<GS, M, D> | undefined;
        // Iterate through node children
        for (const child of this.getChildren(node)) {
            exit = this.minimax(child, depth - 1, -Infinity, Infinity);
            if (exit == SearchExit.TIME) {
                return { exit: SearchExit.TIME, best: best };
            }
            if (best == undefined || child.inheritedValue > best.inheritedValue) {
                best = child;
            }
        }
        return { exit: exit, best: best };
    }

    /**
     * Find the best child of a node using alpha beta pruning
     * @param node Node to find best child of
     * @param depth Depth to limit search to
     * @param alpha Current alpha value
     * @param beta current beta value
     * @returns Reason for exit and opional best child
     */
    protected alphaBetaBestChild(
        node: Node<GS, M, D>,
        depth: number,
        alpha: number,
        beta: number,
    ): { exit: SearchExit; best: Node<GS, M, D> | undefined } {
        let exit = SearchExit.FULL_DEPTH;
        let best: Node<GS, M, D> | undefined;
        switch (node.aim) {
            case NodeAim.MAX:
                // Iterate through node children
                for (const child of this.getChildren(node)) {
                    // score is assigned directly to child, exit if timeout
                    exit = this.minimax(child, depth - 1, alpha, beta);
                    if (exit == SearchExit.TIME) {
                        return { exit: SearchExit.TIME, best: best };
                    }
                    // Check best child and cutoff
                    if (best == undefined || child.inheritedValue > best.inheritedValue) {
                        best = child;
                        if (best.inheritedValue > beta) {
                            break;
                        }
                        alpha = Math.max(alpha, best.inheritedValue);
                    }
                }
                break;
            case NodeAim.MIN:
                // Iterate through node children
                for (const child of this.getChildren(node)) {
                    // score is assigned directly to child, exit if timeout
                    exit = this.minimax(child, depth - 1, alpha, beta);
                    if (exit == SearchExit.TIME) {
                        return { exit: SearchExit.TIME, best: best };
                    }
                    // Check best child and cutoff
                    if (best == undefined || child.inheritedValue < best.inheritedValue) {
                        best = child;
                        if (best.inheritedValue < alpha) {
                            break;
                        }
                        beta = Math.min(beta, best.inheritedValue);
                    }
                }
                break;
        }
        return { exit: exit, best: best };
    }

    /**
     *
     * @param node Node to assign value to
     * @param leaf `true` if node is a leaf
     * @returns reason for exit. Either {@link SearchExit.FULL_DEPTH} or {@link SearchExit.DEPTH}.
     */
    protected assignNodeValue(node: Node<GS, M, D>, leaf: boolean): SearchExit {
        // Assign value and depth
        node.inheritedValue = this.EvaluateNode(node);
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
