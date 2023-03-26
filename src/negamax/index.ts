import { SearchOpts, SearchResult } from "../tree/search.js";

/** Options to configure the behaviour of the negamax search.
 *
 * `opts` property of {@link Negamax}.
 *
 * ## Recommended usage
 * Set the {@link NegamaxOpts.optimal} flag to `true` for
 * fast searching, effective pruning and reduced memory usage.
 * Then use the {@link NegamaxOpts.method} property along with the
 * corresponding {@link NegamaxOpts.depth} or {@link NegamaxOpts.timeout}
 * properties accordingly.
 *
 * ## Advanced usage
 * ### Search tuning
 * Set the {@link NegamaxOpts.optimal} flag to `false` and try
 * different combinations of {@link NegamaxOpts.pruning},
 * {@link NegamaxOpts.presort}, {@link NegamaxOpts.sortMethod} and
 * {@link NegamaxOpts.genBased} to achieve the desired performance.
 *
 * ### Initial Depth
 * Setting {@link NegamaxOpts.initialDepth} > 1 could potentially speed up searches.
 *
 * ### Prune by path length
 * The {@link NegamaxOpts.pruneByPathLength} flag enables fast wins and slow losses.
 * When choosing between 2 nodes with the same value, if the value is positive,
 * it will favour one that is fewer moves away (or is a leaf node).
 * If the value is negative, the one that
 * is more moves away. The opposite holds if the parent is a minimising node.
 *
 * Does not work with {@link NegamaxOpts.optimal} set to `true`.
 *
 * ### Node removal
 * The {@link NegamaxOpts.removalMethod} option allows for trimming nodes
 * that aren't needed from the game tree in between successive searches in
 * {@link SearchMethod.DEEPENING} and {@link SearchMethod.TIME} modes.
 * This can greatly reduce memory usage and allow
 * for far deeper searches, but with more computation required.
 *
 * There are 3 options:
 * - {@link RemovalMethod.ALWAYS} = remove nodes after every depth search.
 * - {@link RemovalMethod.DEPTH} = remove nodes when search depth is
 * \>\= {@link NegamaxOpts.removalDepth}.
 * - {@link RemovalMethod.COUNT} = remove nodes when node count is \>\=
 * {@link NegamaxOpts.removalCount}.
 *
 * ## Random selections
 * These options can be useful for making the AI less 'robotic'. Neither of them
 * work with {@link NegamaxOpts.pruneByPathLength} or
 * {@link NegamaxOpts.optimal} set to `true`.
 * The {@link NegamaxOpts.randomWeight} option does not work with {@link NegamaxOpts.pruning}
 * set to {@link PruningType.ALPHA_BETA}.
 * They will run but likely give incorrect results.
 *
 * The {@link NegamaxOpts.randomBest} option will randomly select from the child nodes
 * that all have the best value.
 *
 * The {@link NegamaxOpts.randomWeight} option selects from all the children,
 * but is weighted towards the best valued. The weighting effect is outlined
 * in the property documentation.
 * @category Negamax
 */
export class NegamaxOpts extends SearchOpts {
    /**
     * Set to `true` to override other options and run an optimised negamax function.
     *
     * Overrides:
     * - {@link NegamaxOpts.pruning} = {@link PruningType.ALPHA_BETA}
     * - {@link NegamaxOpts.genBased} = `true`
     * - {@link NegamaxOpts.presort} = `true`
     * - {@link NegamaxOpts.sortMethod} = {@link SortMethod.BUBBLE_EFFICIENT}
     * - {@link NegamaxOpts.pruneByPathLength} = false
     *
     * Invalidates:
     * - {@link NegamaxOpts.randomBest}
     * - {@link NegamaxOpts.randomWeight}
     *
     * @see [Optimal function in blog post](https://domwil.co.uk/minimaxer/part4/#optimal-function).
     *
     */
    optimal = false;
}

/**
 * Object returned after searching the tree using negamax.
 * @category Negamax
 */
export class NegamaxResult<M> extends SearchResult<M> {}
