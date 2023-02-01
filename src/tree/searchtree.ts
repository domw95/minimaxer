import { Tree } from "./tree.js";
import { Node } from "./node.js";
import { EvaluateNodeFunc } from "./interfaces.js";
import { SearchExit, SearchOpts } from "./search.js";
import { bubbleSort, bubbleSortEfficient, SortMethod } from "./sorting.js";

/**
 * Extends the tree class with function specifically for minimax searches
 */
export class SearchTree<GS, M, D> extends Tree<GS, M, D> {
    /** Tracks whether a searched has expired due to time */
    protected expired = false;
    /** Time the search will expire. 0 disables expiry */
    protected expireTime = 0;
    /** Flags that full depth has *not* been reached when set to false*/
    protected fullDepth = true;
    /** Enables postsort of children internally */
    protected postsortEnable = false;
    /** Enables presort of children internally */
    protected presortEnable = false;
    /** Number of leaf or depth = 0 reached during current call */
    protected outcomes = 0;
    constructor(root: Node<GS, M, D>, public opts: SearchOpts = new SearchOpts()) {
        super(root);
    }

    EvaluateNode: EvaluateNodeFunc<GS, M, D> = (node: Node<GS, M, D>) => {
        if (!isNaN(node.value)) {
            return node.value;
        } else {
            throw Error("Value has not been defined");
        }
    };

    /**
     * Checks if expiry is enable and has happened
     * @returns `true` if time has expired, otherwise `false`
     */
    protected checkExpiry(): boolean {
        if (this.expireTime) {
            if (this.expired) {
                return true;
            } else if (Date.now() > this.expireTime) {
                this.expired = true;
                return true;
            }
        }
        return false;
    }

    /**
     * Returns either the array of node children or a generator which may create children on the fly
     * Also presorts children if enabled
     * @param node Node to return an iterable of children
     * @returns An iterable for going through children of node
     */
    protected getChildren(node: Node<GS, M, D>): Iterable<Node<GS, M, D>> {
        if (this.opts.genBased) {
            // Get moves if not already on node
            if (!node.moves.length) {
                node.moves = this.GetMoves(node);
            } else if (this.presortEnable) {
                this.sortChildren(node);
            }
            return this.childGen(node);
        } else {
            // Create children if required
            // sort enabled and children already present
            if (!this.createChildren(node)) {
                // Children already created, sort by inherited value
                if (this.presortEnable) {
                    this.sortChildren(node);
                }
            }
            return node.children;
        }
    }

    /**
     * Gets the best child of `node`, assigns and sorts children if postsort is enabled
     * @param node Node to find best child of
     */
    protected assignBestChild(node: Node<GS, M, D>, bestChild?: Node<GS, M, D>): void {
        // Find the best child
        if (this.postsortEnable) {
            // sort children and pick best
            node.child = this.sortChildren(node);
        } else if (bestChild !== undefined) {
            node.child = bestChild;
        } else {
            node.child = this.bestChild(node);
        }
        node.inheritedValue = -node.child.inheritedValue;
        node.inheritedDepth = this.activeDepth;
        node.pathLength = node.child.pathLength + 1;
    }

    /**
     * Finds the child with maximum inherited value in children
     * @param node Node to find best child of
     * @returns Best child of node
     */
    protected bestChild(node: Node<GS, M, D>): Node<GS, M, D> {
        return node.children.reduce((prevNode, curNode) => {
            if (curNode.inheritedDepth == this.activeDepth) {
                if (curNode.inheritedValue > prevNode.inheritedValue) {
                    return curNode;
                } else if (curNode.inheritedValue == prevNode.inheritedValue) {
                    if (!this.opts.pruneByPathLength) {
                        return prevNode;
                    }
                    if (curNode.pathLength < prevNode.pathLength && curNode.inheritedValue > 0) {
                        return curNode;
                    } else if (curNode.pathLength > prevNode.pathLength && curNode.inheritedValue < 0) {
                        return curNode;
                    } else {
                        return prevNode;
                    }
                } else {
                    return prevNode;
                }
            } else {
                return prevNode;
            }
        });
    }

    /**
     * Sorts the child nodes of given node according to inherited value, descending.
     * @param node Node of children to sort
     * @returns The child with the highest value
     */
    protected sortChildren(node: Node<GS, M, D>): Node<GS, M, D> {
        const opts = this.opts;
        function sortFunc(a: Node<GS, M, D>, b: Node<GS, M, D>) {
            if (b.inheritedDepth == a.inheritedDepth) {
                // If option to prune for shorter wins and longer losses enabled
                if (opts.pruneByPathLength) {
                    // Only care if values are the same
                    if (b.inheritedValue == a.inheritedValue) {
                        if (b.inheritedValue >= 0) {
                            return a.pathLength - b.pathLength;
                        } else {
                            return b.pathLength - a.pathLength;
                        }
                    } else {
                        return b.inheritedValue - a.inheritedValue;
                    }
                } else {
                    return b.inheritedValue - a.inheritedValue;
                }
            } else if (b.inheritedDepth > a.inheritedDepth) {
                return 1;
            } else {
                return 0;
            }
        }
        switch (this.opts.sortMethod) {
            case SortMethod.DEFAULT:
                node.children.sort(sortFunc);
                break;
            case SortMethod.BUBBLE:
                bubbleSort(node.children);
                break;
            case SortMethod.BUBBLE_EFFICIENT:
                bubbleSortEfficient(node.children);
                break;
        }

        return node.children[0];
    }

    /** Generator that yields all the nodes along the optimal
     * path, starting from and including `node` */
    protected *routeGen(node: Node<GS, M, D>): Generator<Node<GS, M, D>> {
        yield node;
        while (node.child != undefined) {
            node = node.child;
            yield node;
        }
    }
    /** Generator that yields all the moves along the optimal path  */
    protected *optimalMoveGen(node: Node<GS, M, D>): Generator<M> {
        for (const child of this.routeGen(node)) {
            yield child.move;
        }
    }

    /**
     * @returns A list of moves from the active root {@link Node} that represent the optimal sequence through the game.
     */
    getOptimalMoves(): M[] {
        return [...this.optimalMoveGen(this.activeRoot)];
    }
}
