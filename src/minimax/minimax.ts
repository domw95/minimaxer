import { SearchTree } from "../tree/searchtree.js";
import { MinimaxOpts, MinimaxResult } from "./index.js";
import { Node, NodeAim, NodeType, PruningType, SearchExit } from "../index.js";

/**
 * Interface for performing a minimax search
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

    // Goes through to find best child using alpha beta pruning
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
    protected assignNodeValue(node: Node<GS, M, D>, leaf: boolean) {
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
