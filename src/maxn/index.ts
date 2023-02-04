import { SearchOpts, SearchResult } from "../tree/search.js";

/** Options unique to minimax to change its behaviour */
export class MaxnOpts extends SearchOpts {}

/** Object returned after searching the tree using negamax */
export class MaxnResult<M> extends SearchResult<M> {}
