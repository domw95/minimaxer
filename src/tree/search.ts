import { SortMethod } from "./sorting.js";

/**
 * Search method to use
 */
export const enum SearchMethod {
    /** Go to depth specified by {@link SearchOpts.depth} */
    DEPTH,
    /**  */
    FULL_DEPTH,
    /**  */
    DEEPENING,
    /**  */
    TIME,
}

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

/** Pruning types */
export const enum PruningType {
    /** Do not prune any nodes */
    NONE,
    /** Prune using alpha-beta */
    ALPHA_BETA,
}

/**
 * Class representing common options for searching a {@link Tree}
 */
export class SearchOpts {
    /** Timeout used for **all** searches */
    timeout = 0;
    /** Default depth for depth and deepening searches */
    depth = 0;
    /** Method used to search for best move */
    method = SearchMethod.DEPTH;
    /** Method used to sort nodes */
    sortMethod = SortMethod.DEFAULT;
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
    /** Sort children of node before searching deeper */
    presort = false;
    /** Set to `true` to shorten winning paths and lengthen losing paths.
     *  Only works when combined with {@link PruningType.ALPHA_BETA}
     */
    pruneByPathLength = false;
}

export class SearchResult<M> {
    /**
     * @param exit Reason the search has stopped and result returned.
     * @param move The best move from the {@link Tree.activeRoot}.
     * @param value Value of {@link Tree.activeRoot} according to search
     * @param depth Depth reached and fully searched
     * @param outcomes Number of nodes at bottom of tree (not neccessarily leaves).
     * @param nodes  Number of nodes in full tree
     * @param pathLength Minimum number of moves until a leaf node
     */
    constructor(
        public exit: SearchExit,
        public move: M,
        public value: number,
        public depth: number,
        public outcomes: number,
        public nodes: number,
        public pathLength: number,
    ) {}
}
