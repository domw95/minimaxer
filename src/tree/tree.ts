import { Node, NodeAim, NodeType } from "./node.js";
import { CreateChildNodeFunc, EvaluateGamestateFunc, GetMovesFunc } from "./interfaces.js";

/**
 * Represents the reason for terminating the search
 */
export const enum SearchExit {
    /** At least 1 path did not reach a leaf node */
    DEPTH,
    /** All paths reached leaf nodes */
    FULL_DEPTH,
    /** Searched concluded because of timeout */
    TIME,
}

/**
 * Representation of a game tree for any turn based game with any number of players.
 */
export class Tree<GS, M> {
    /**
     * Original root when tree was created
     */
    root: Node<GS, M>;
    /**
     * Active root, only differs from root after traversing tree
     */
    activeRoot: Node<GS, M>;
    /** Number of nodes in tree */
    nodeCount = 0;
    /** Number of leaf nodes in tree */
    leafCount = 0;

    /**
     *
     * @param gamestate The current state of game, placed at root node. Can be any type
     * @param aim The current players aim at root node
     */
    constructor(
        gamestate: GS,
        aim: NodeAim,
        public GetMovesFunc: GetMovesFunc<GS, M>,
        public CreateChildNodeFunc: CreateChildNodeFunc<GS, M>,
        public EvaluateGamestateFunc: EvaluateGamestateFunc<GS>,
    ) {
        this.root = new Node(NodeType.ROOT, gamestate);
        this.root.aim = aim;
        this.activeRoot = this.root;
    }
    /**
     * Generates all children of given node. Does nothing if branches and children already present
     * @param node Node to create children for
     * @returns true if nodes created, false if already existed
     */
    protected createChildren(node: Node<GS, M>): boolean {
        // Check if children already created for node
        if (node.children.length > 0) {
            return false;
        }

        let n_moves = node.moves.length;
        // Get moves for nodes if not already there
        if (n_moves == 0) {
            node.moves = this.GetMovesFunc(node.gamestate);
            n_moves = node.moves.length;
        }

        node.children = new Array<Node<GS, M>>(n_moves);
        // Create all child nodes
        for (let i = 0; i < n_moves; i++) {
            const child = this.CreateChildNodeFunc(node.gamestate, node.moves[i]);
            child.parent = node;
            node.children[i] = child;
            this.nodeCount++;
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
    protected createTree(node: Node<GS, M>) {
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
    protected *childGen(node: Node<GS, M>): Generator<Node<GS, M>> {
        // Yield children already created first
        for (const child of node.children) {
            yield child;
        }
        // Then create new ones from moves
        const nMoves = node.moves.length;
        while (node.moveInd < nMoves) {
            const move = node.moves[node.moveInd];
            const child = this.CreateChildNodeFunc(node.gamestate, move);
            child.parent = node;
            child.move = move;
            node.children.push(child);
            node.moveInd++;
            this.nodeCount++;
            yield child;
        }
    }

    /**
     * Finds the child with maximum value in children
     * @param node Node to find best child of
     * @returns Best child of node
     */
    protected bestChild(node: Node<GS, M>): Node<GS, M> {
        return node.children.reduce((prevNode, node) => {
            if (node.inheritedValue > prevNode.inheritedValue) {
                return node;
            } else {
                return prevNode;
            }
        });
    }

    /**
     * Sorts the child nodes of given node according to value, descending.
     * @param node Node of children to sort
     * @returns The child with the highest value
     */
    protected sortChildren(node: Node<GS, M>): Node<GS, M> {
        return node.children.sort((a, b) => b.inheritedValue - a.inheritedValue)[0];
    }

    /** Generator that yields all the nodes along the optimal
     * path, starting from and including `node` */
    protected *routeGen(node: Node<GS, M>): Generator<Node<GS, M>> {
        yield node;
        while (node.child != undefined) {
            node = node.child;
            yield node;
        }
    }
    /** Generator that yields all the moves along the optimal path  */
    protected *optimalMoveGen(node: Node<GS, M>): Generator<M> {
        for (const child of this.routeGen(node)) {
            if (child.move != undefined) {
                yield child.move;
            }
        }
    }

    getOptimalMoves(): M[] {
        return [...this.optimalMoveGen(this.activeRoot)];
    }

    /**
     * Move the {@link tree.Tree.activeRoot} of the {@link tree.Tree} from the current to one of its children. Effectively 'playing' a move.
     * @param move Move used to move from current node to next
     */
    // traverse(move: unknown) {
    //     // check if branches/children have been added to active root
    //     if (this.activeRoot.branches.length == 0) {
    //         this.createChildren(this.activeRoot);
    //     }
    //     // look in branches for matching move
    //     let activeBranch;
    //     for (const branch of this.activeRoot.branches) {
    //         if (this.moveCompareCallback(branch.move, move)) {
    //             activeBranch = branch;
    //             break;
    //         }
    //     }
    //     if (activeBranch != undefined) {
    //         // remove all other branches and children from current root
    //         this.activeRoot.branches = [activeBranch];
    //         if (activeBranch.child == undefined) {
    //             throw Error("Branch Child Undefined");
    //         }
    //         this.activeRoot.children = [activeBranch.child];
    //         // set a new active root
    //         this.activeRoot = activeBranch.child;
    //     } else {
    //         throw Error("Failed to find branch corresponding to move");
    //     }
    // }

    // Callbacks must be assigned before calling and optimisers
    // Function to compare 2 moves
    //     moveCompareCallback(a: any, b: any): boolean {
    //         return a == b;
    //     }
}
