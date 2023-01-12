import { SearchExit } from "../tree/tree.js";

/** Negamax pruning types */
export const enum PruningType {
    /** Do not prune any nodes */
    NONE,
    /** Prune using alpha-beta */
    ALPHA_BETA,
}

/** Options to configure the behaviour of the negamax search */
export class NegamaxOpts {
    /** Node pruning type, default none */
    pruning: PruningType = PruningType.NONE;
    /**
     * Depth to start from for deepening and time based.
     * Bypassing early depths *may* improve performance.
     */
    initialDepth = 1;
    /**
     * Use the child generator instead of creating all children for each node.
     * Should be faster and use less memory
     */
    genBased = false;
    /**
     * Postsort sorts child nodes after finding value instead of just finding max
     * In theory slower than max, but useful for alpha-beta deepening operation
     * -1 = always, 0 = never, >0 = up to that depth
     */
    postsort = false; //
    /** Sort children of node before searching deeper */
    presort = false;
    /** Timeout used for time based search */
    timeout = 1000;
    /** Default depth for depth and deepening searches */
    depth = 1;
}

/** Object returned after searching the tree using negamax */
export class NegamaxResult<M> {
    /**
     * @param exit Reason the search has stopped and result returned.
     * @param move The best move from the {@link Tree.activeRoot}.
     * @param value Value of {@link Tree.activeRoot} according to search
     * @param depth Depth reached and fully searched
     * @param outcomes Number of nodes at bottom of tree (not neccessarily leaves).
     * @param nodes  Number of nodes in full tree
     */
    constructor(
        public exit: SearchExit,
        public move: M,
        public value: number,
        public depth: number,
        public outcomes: number,
        public nodes: number,
    ) {}
}
