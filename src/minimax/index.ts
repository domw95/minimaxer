import { SearchOpts, SearchResult } from "../tree/search.js";

/**
 * Change the behaviour of the minimax search.
 *
 * The following options are not yet supported:
 * - {@link MinimaxOpts.pruneByPathLength}
 * - {@link MinimaxOpts.randomBest}
 * - {@link MinimaxOpts.randomWeight}
 * @category Minimax
 */
export class MinimaxOpts extends SearchOpts {}

/**
 * Type of object returned after calling {@link Minimax.evaluate}
 * on a {@link Minimax} tree.
 * @category Minimax
 */
export class MinimaxResult<M> extends SearchResult<M> {}
