import { SearchOpts, SearchResult } from "../tree/search.js";

/** Options unique to minimax to change its behaviour */
export class MinimaxOpts extends SearchOpts {}

/** Object returned after searching the tree using negamax */
export class MinimaxResult<M> extends SearchResult<M> {}
