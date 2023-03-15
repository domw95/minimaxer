/**
 * Enum and class definitions associated with searching the game tree
 */
import { SortMethod } from "./sorting.js";

/**
 * Search method to use when traversing the game tree.
 * 
 * Located in an instance of {@link SearchOpts} at {@link SearchOpts.method | SearchOpts.method}.
 */
export const enum SearchMethod {
    /** Go to depth specified by {@link SearchOpts.depth | SearchOpts.depth} in SearchOpts */
    DEPTH,
    /** @alpha Search the entire tree i.e all leaf nodes */
    FULL_DEPTH,
    /** 
     * Search iteratively deeper starting from {@link SearchOpts.initialDepth | SearchOpts.initialDepth} 
     * up to {@link SearchOpts.depth | SearchOpts.depth}
     */
    DEEPENING,
    /** 
     * Same as {@link SearchMethod.DEEPENING} but stops after the time
     * in {@link SearchOpts.timeout | SearchOpts.timeout} has elapsed.
     */
    TIME,
    /**
     * Search is limited by time or depth, whichever comes first.
     * @alpha Not yet implemented
     */
    TIME_AND_DEPTH,
}

/**
 * Represents the reason for terminating the search
 */
export const enum SearchExit {
    /** 
     * At least 1 path did not reach a leaf node, and the depth set by
     * {@link SearchOpts.depth | SearchOpts.depth} was reached.
    */
    DEPTH,
    /** All paths reached leaf nodes */
    FULL_DEPTH,
    /** Searched concluded because of timeout set in 
     * {@link SearchOpts.timeout | SearchOpts.timeout}.
     */
    TIME,
}

/** Pruning types. Located in an instance of {@link SearchOpts} at {@link SearchOpts.pruning | SearchOpts.pruning}.*/
export const enum PruningType {
    /** Do not prune any nodes */
    NONE,
    /** Prune using alpha-beta */
    ALPHA_BETA,
}

/**
 * Class representing common options for searching a {@link Tree}.
 * 
 * Derived classes are used and attached to their corresponding tree.
 */
export class SearchOpts {
    /** Timeout used for **all** searches */
    timeout = 0;
    /** Default depth for depth and deepening searches */
    depth = 0;
    /** Method used to search for best move. See {@link SearchMethod} for details*/
    method = SearchMethod.DEPTH;
    /** Method used to sort nodes if {@link SearchOpts.presort} is enabled */
    sortMethod = SortMethod.DEFAULT;
    /** Node pruning type, default none 
     * @see [Alpha-beta pruning in blog post](https://domwil.co.uk/minimaxer/part2/#alpha-beta-pruning).
    */
    pruning: PruningType = PruningType.NONE;
    /**
     * Depth to start from for deepening and time based.
     * Bypassing early depths *may* improve performance.
     */
    initialDepth = 1;
    /**
     * Use the child generator instead of creating all children for each node.
     * Should be faster and use less memory.
     * 
     * @see [Generators in blog post](https://domwil.co.uk/minimaxer/part4/#the-node-generator).
     */
    genBased = false;
    /** Sort children of node before searching deeper.
     * @see [Presort in blog post](https://domwil.co.uk/minimaxer/part2/#pre-sorting)
    */
    presort = false;
    /** Set to `true` to shorten winning paths and lengthen losing paths.
     *  Only works when combined with {@link PruningType.ALPHA_BETA}
     */
    pruneByPathLength = false;
    /**
     * @experimental 
     * Select random best child (same value)
     * Does not choose from pruned branches
     */
    randomBest = false;
    /**
     * @experimental 
     * Select randomly, weighted in favour of better values
     * Weighting is determined by config value.
     * randomWeight = 0, disabled
     * randomWeight = 1, equal probabilty
     * randomWeight = 5, 5 times more likely for every +1 valuation
     */
    randomWeight = 0;
}

export class SearchResult<M> {
    /**
     * @param exit Reason the search has stopped and result returned.
     * @param move The best move from the {@link Tree.activeRoot}.
     * @param value Value of {@link Tree.activeRoot} according to search.
     * @param depth Depth reached and fully searched.
     * @param outcomes Number of nodes at bottom of tree (not neccessarily leaves).
     * @param nodes  Number of nodes in full tree.
     * @param pathLength Minimum number of moves until a leaf node.
     */
    constructor(
        public exit: SearchExit,
        public move: M,
        public value: number,
        public depth: number,
        public outcomes: number,
        public nodes: number,
        public pathLength: number,
    ) { }
}
