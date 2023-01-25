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
    /**
     * Postsort sorts child nodes after finding value instead of just finding max
     * In theory slower than max, but useful for alpha-beta deepening operation
     * -1 = always, 0 = never, >0 = up to that depth
     */
    postsort = false; //
    /** Sort children of node before searching deeper */
    presort = false;
    /** Set to `true` to shorten winning paths and lengthen losing paths.
     *  Only works when combined with {@link PruningType.ALPHA_BETA}
     */
    pruneByPathLength = false;
}
