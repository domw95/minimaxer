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
 */
export class Node<GS, M> {
    /** Defines how best child node is selected */
    aim: NodeAim = NodeAim.NONE;
    /** parent of this node, undefined if node is root */
    parent: Node<GS, M> | undefined;
    /** List of the child nodes that link to this node */
    children: Node<GS, M>[] = [];
    /** Index of next move to be branched */
    moveInd = 0;
    /** Value of the gamestate at this node */
    value = 0;
    /** Value used for selection by parent of this node */
    inheritedValue = 0;
    /** Scores used for multiplayer minimax */
    scores: number[] = [];
    /** Reference to all the possible moves from this node */
    moves: Array<M> = [];
    /** Best child as selected by  {@link Node.aim}*/
    child: Node<GS, M> | undefined;

    /**
     * @param type Defines location within tree. See {@link NodeType}
     * @param gamestate Gamestate used to create the node. Should be a clone of that used in the game.
     * @param move Move used to reach this node. Undefined if node is root.
     */
    constructor(public type: NodeType, public gamestate: GS, public move?: M) {}
}
