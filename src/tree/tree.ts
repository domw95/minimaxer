import { Node, NodeType } from "./node.js";
import { CreateChildNodeFunc, GetMovesFunc } from "./interfaces.js";

/**
 * Representation of a game tree for any turn based game with any number of players.
 * @typeParam GS - The object representing the state of the game
 * @typeParam M - The object representing a move in the game
 * @typeParam D - Extra data used in evaluation not suitable for storing in the gamestate
 */
export class Tree<GS, M, D> {
    /**
     * Original root when tree was created
     */
    root: Node<GS, M, D>;
    /**
     * Active root used for the creation and searching of tree.
     * Set to {@link Tree.root} in constructor.
     */
    activeRoot: Node<GS, M, D>;
    /** Number of nodes in tree */
    nodeCount = 0;
    /** Number of leaf nodes in tree */
    leafCount = 0;
    /** Maximum depth of current search */
    protected activeDepth = 0;

    /** Callback to get the moves for a gamestate attached to a {@link Node}. */
    GetMoves: GetMovesFunc<GS, M, D> = () => {
        throw Error("Get moves callback is not implemented");
    };
    /** Callback to create a child of a parent node using a move */
    CreateChildNode: CreateChildNodeFunc<GS, M, D> = () => {
        throw Error("Create child node callback is not implemented");
    };

    /**
     *
     * @param gamestate The current state of game, placed at root node. Can be any type
     * @param aim The current players aim at root node
     */
    constructor(root: Node<GS, M, D>) {
        this.root = root;
        this.activeRoot = this.root;
        this.nodeCount = 1;
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
     * Creates the full game tree starting from {@link Tree.activeRoot}.
     *
     * Uses the {@link Tree.GetMoves} and {@link Tree.CreateChildNode} callbacks.
     *
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

    removeNodes(): void {
        this.removeNonBestNodes(this.activeRoot, 0);
    }

    /**
     * Recursively go through node and its children removing all
     * nodes that are not best
     */
    protected removeNonBestNodes(node: Node<GS, M, D>, depth: number) {
        // Check if node has 0 children
        if (node.children.length == 0) {
            return;
        }
        // Iterate through children
        for (const child of node.children) {
            this.removeNonBestNodes(child, depth + 1);
        }

        // remove non best children of this node
        if (depth > 0) {
            this.nodeCount -= node.children.length - 1;
            node.children = [node.child as Node<GS, M, D>];
        }
    }
}
