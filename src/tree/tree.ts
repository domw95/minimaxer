import { Node, NodeType } from "./node.js";
import { CreateChildNodeFunc, EvaluateNodeFunc, GetMovesFunc } from "./interfaces.js";
import { SearchOpts } from "./search.js";
import { bubbleSort, bubbleSortEfficient, SortMethod } from "./sorting.js";

/**
 * Representation of a game tree for any turn based game with any number of players.
 */
export class Tree<GS, M, D> {
    /**
     * Original root when tree was created
     */
    root: Node<GS, M, D>;
    /**
     * Active root, only differs from root after traversing tree
     */
    activeRoot: Node<GS, M, D>;
    /** Number of nodes in tree */
    nodeCount = 0;
    /** Number of leaf nodes in tree */
    leafCount = 0;
    /** Depth of current search */
    protected activeDepth = 0;

    GetMoves: GetMovesFunc<GS, M, D> = () => {
        throw Error("Get moves callback is not implemented");
    };

    CreateChildNode: CreateChildNodeFunc<GS, M, D> = () => {
        throw Error("Create child node callback is not implemented");
    };

    EvaluateNode: EvaluateNodeFunc<GS, M, D> = (node: Node<GS, M, D>) => {
        if (!isNaN(node.value)) {
            return node.value;
        } else {
            throw Error("Value has not been defined");
        }
    };

    /**
     *
     * @param gamestate The current state of game, placed at root node. Can be any type
     * @param aim The current players aim at root node
     */
    constructor(root: Node<GS, M, D>, public opts: SearchOpts = new SearchOpts()) {
        this.root = root;
        this.activeRoot = this.root;
    }
    /**
     * Generates all children of given node. Does nothing if branches and children already present
     * @param node Node to create children for
     * @returns true if nodes created, false if already existed
     */
    protected createChildren(node: Node<GS, M, D>): boolean {
        // Check if children already created for node
        if (node.children.length > 0) {
            return false;
        }

        let n_moves = node.moves.length;
        // Get moves for nodes if not already there
        if (n_moves == 0) {
            node.moves = this.GetMoves(node);
            n_moves = node.moves.length;
        }

        node.children = new Array<Node<GS, M, D>>(n_moves);
        // Create all child nodes
        for (let i = 0; i < n_moves; i++) {
            const child = this.CreateChildNode(node, node.moves[i]);
            child.parent = node;
            node.children[i] = child;
            this.nodeCount++;
            child.uuid = this.nodeCount;

            if (child.type == NodeType.LEAF) {
                this.leafCount++;
            }
        }
        return true;
    }

    /**
     * Creates the full game tree recursively starting from given node
     * @param node Parent node
     */
    protected createTree(node: Node<GS, M, D>) {
        // Create child nodes
        this.createChildren(node);
        // Create grandchild for each child that isnt a LEAF node
        for (const child of node.children) {
            if (child.type != NodeType.LEAF) {
                this.createTree(child);
            }
        }
    }

    /**
     * Creates the full game tree starting from {@link Tree.activeRoot}
     */
    createFullTree(): void {
        // Call the createTree recursive function from activeRoot
        this.createTree(this.activeRoot);
    }

    /**
     * Generate all the children of node, starting from those already created
     * @param node Node to create children for
     */
    protected *childGen(node: Node<GS, M, D>): Generator<Node<GS, M, D>> {
        // Yield children already created first
        for (const child of node.children) {
            yield child;
        }
        // Then create new ones from moves
        const nMoves = node.moves.length;
        while (node.moveInd < nMoves) {
            const move = node.moves[node.moveInd];
            const child = this.CreateChildNode(node, move);
            child.parent = node;
            child.move = move;
            node.children.push(child);
            node.moveInd++;
            this.nodeCount++;
            yield child;
        }
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
