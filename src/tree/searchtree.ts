import { Tree } from "./tree.js";
import { Node } from "./node.js";
import { EvaluateNodeFunc } from "./interfaces.js";
import { SearchOpts } from "./search.js";
import { bubbleSort, bubbleSortEfficient, SortMethod } from "./sorting.js";

/**
 * Extends the tree class with function specifically for minimax searches
 */
export class SearchTree<GS, M, D> extends Tree<GS, M, D> {
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
