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
 * It is used to select the best of the {@link Node | Nodes} children by their corresponding value,
 * and therefore to assign a value to the Node.
 */
export const enum NodeAim {
    /** Current player will select minimum of children values */
    MIN = -1,
    /**
     * Default value, error if used during normal search.
     */
    NONE,
    /** Current player will select maximum of children values */
    MAX = 1,
    /** @hidden Node value is based on the mean of all the children (equal probability e.g 1 die)*/
    MEAN,
    /** @hidden Node value is based on the probability of all children (e.g 2 dice)*/
    PROB,
}

/**
 * Representation of a node in the game {@link Tree}.
 *
 * Holds the gamestate, a list of moves and a list of child nodes.
 * @typeParam GS - The object representing the state of the game
 * @typeParam M - The object representing a move in the game
 * @typeParam D - Extra data used in evaluation not suitable for storing in the gamestate
 */
export class Node<GS, M, D> {
    /** parent of this node, undefined if node is root */
    parent: Node<GS, M, D> | undefined;
    /** List of the child nodes that link to this node */
    children: Node<GS, M, D>[] = [];
    /** Index of next move to be branched */
    moveInd = 0;
    /** Value of the gamestate at this node */
    value = NaN;
    /** Value used for selection by parent of this node */
    inheritedValue = NaN;
    /**
     * Search depth when inherited value was assigned
     * Use to remove false selections when a-b pruning
     */
    inheritedDepth = -1;
    /** Minimum number of moves required until a leaf node is reached. */
    pathLength = 1;
    /** Scores used for multiplayer minimax */
    scores: number[] = [];
    /** scores inherited from best child */
    inheritedScores: number[] = [];
    /** Player to play turn from this node */
    activePlayer = 0;

    /** Best child as selected by  {@link Node.aim}*/
    child: Node<GS, M, D> | undefined;
    /**`true` if any children of node have been pruned, `false` if full search */
    pruned = false;
    /** Count of decendant nodes */
    descendantCount = 0;

    /**
     * @param type Defines location within tree. See {@link NodeType}.
     * @param gamestate Gamestate used to create the node. Should be a clone of that used in the actual game.
     * @param move Move used to reach this node. For root node, use a `Null` version of the correct data type.
     * @param data Extra data accessible by the evaluation function. If not used, set to 0.
     * @param aim Defines how best child node is selected.
     * @param moves Reference to all the possible moves from this node.
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
