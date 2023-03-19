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
    /** Go to depth specified by
     * {@link SearchOpts.depth | SearchOpts.depth}. */
    DEPTH,
    /**
     * Search iteratively deeper starting from {@link SearchOpts.initialDepth | SearchOpts.initialDepth}
     * up to {@link SearchOpts.depth | SearchOpts.depth}.
     */
    DEEPENING,
    /**
     * Same as {@link SearchMethod.DEEPENING} but stops after the time
     * in {@link SearchOpts.timeout | SearchOpts.timeout} has elapsed.
     *
     * If {@link SearchOpts.depth | SearchOpts.depth} is non-zero, performs a time
     * and depth limited search.
     *
     * If {@link SearchOpts.timeout | SearchOpts.timeout}
     * and {@link SearchOpts.depth | SearchOpts.depth}
     * are 0, performs a full depth search.
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
    /** Method used to search for best move. See {@link SearchMethod} for details*/
    method = SearchMethod.DEPTH;
    /** Timeout used for **all** searches. Timeout disabled when set to 0.*/
    timeout = 0;
    /** Default search depth for depth and deepening searches.*/
    depth = 0;
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
    /** Method used to sort nodes if {@link SearchOpts.presort} is enabled */
    sortMethod = SortMethod.DEFAULT;
    /** Set to `true` to shorten winning paths and lengthen losing paths.
     *  Only works when combined with {@link PruningType.ALPHA_BETA | PruningType.ALPHA_BETA}.
     * Is disabled for {@link Negamax} when {@link Negamax.optimal} is `true`.
     *
     * Check {@link Negamax}, {@link Minimax} or {@link Maxn} (and corresponing Opts) for
     * specific support.
     */
    pruneByPathLength = false;
    /**
     * @experimental
     * Select randomly from all of the children with the best value.
     *
     * Check {@link Negamax}, {@link Minimax} or {@link Maxn} (and corresponing Opts) for
     * specific support.
     */
    randomBest = false;
    /**
     * @experimental
     * Select randomly, weighted in favour of better values
     * Weighting is determined by config value.
     * - randomWeight = 0, disabled
     * - randomWeight = 1, equal probabilty
     * - randomWeight = 5, 5 times more likely for every +1 valuation
     *
     * Check {@link Negamax}, {@link Minimax} or {@link Maxn} (and corresponing Opts) for
     * specific support.
     */
    randomWeight = 0;
}

/**
 * Represents the reason for terminating the search.
 *
 * Property of {@link SearchResult}.
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

/** Object that is returned after a search has been completed */
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
    ) {}
}
