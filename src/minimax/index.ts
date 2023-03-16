import { SearchOpts, SearchResult } from "../tree/search.js";

/** Change the behaviour of the minimax search */
export class MinimaxOpts extends SearchOpts {}

/**
 * Type of object returned after calling {@link Minimax.evaluate}
 * on a {@link Minimax} tree.
 */
export class MinimaxResult<M> extends SearchResult<M> {}
