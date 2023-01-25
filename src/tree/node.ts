/**
 * Defines the type of {@link Node}.
 */
export const enum NodeType {
    /** Node has no parent. Used to initialise {@link Tree} */
    ROOT,
    /** Node has parent and children */
    INNER,
    /** Node has no children. End of game condition. */
    LEAF,
}

/**
 * Defines the goal at the current gamestate for selecting children.
 * Value of the {@link Node | Nodes} child is chosen by applying the {@link NodeAim} to its children.
 */
export const enum NodeAim {
    /** Current player will select minimum of children values */
    MIN = -1,
    NONE,
    /** Current player will select maximum of children values */
    MAX = 1,
    /** Node value is based on the mean of all the children (equal probability e.g 1 die)*/
    MEAN,
    /** Node value is based on the probability of all children (e.g 2 dice)*/
    PROB,
}

/**
 * Representation of a node in the game {@link Tree}.
 * Holds the gamestate, list of moves and child nodes.
 * @typeparam GS - The object representing the state of the game
 * @typeparam M - The object representing a move in the game
 * @typeparam D - Extra data used in evaluation not suitable for storing in the gamestate
 */
export class Node<GS, M, D> {
    /** parent of this node, undefined if node is root */
    parent: Node<GS, M, D> | undefined;
    /** List of the child nodes that link to this node */
    children: Node<GS, M, D>[] = [];
    /** Index of next move to be branched */
    moveInd = 0;
    /** Value of the gamestate at this node */
    value = 0;
    /** Value used for selection by parent of this node */
    inheritedValue = 0;
    /**
     * Search depth when inherited value was assigned
     * Use to remove false selections when a-b pruning
     */
    inheritedDepth = 0;
    /** Minimum number of moves required until a leaf node is reached. */
    pathLength = 1;
    /** Scores used for multiplayer minimax */
    scores: number[] = [];

    /** Best child as selected by  {@link Node.aim}*/
    child: Node<GS, M, D> | undefined;

    /**
     * @param type Defines location within tree. See {@link NodeType}
     * @param gamestate Gamestate used to create the node. Should be a clone of that used in the game.
     * @param move Move used to reach this node. For root node, use a `Null` version of the correct data type
     * @param data Extra data accessible by the evaluation function. If not used, set to 0
     * @param aim Defines how best child node is selected
     * @param moves Reference to all the possible moves from this node
     */
    constructor(
        public type: NodeType,
        public gamestate: GS,
        public move: M,
        public data: D,
        public aim = NodeAim.NONE,
        public moves: Array<M> = [],
    ) {}
}
