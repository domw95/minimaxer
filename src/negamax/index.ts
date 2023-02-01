import { SearchOpts, SearchResult } from "../tree/search.js";

/** Options to configure the behaviour of the negamax search */
export class NegamaxOpts extends SearchOpts {
    /**
     * Set to `true` to override other options and run optimised negamax
     */
    optimal = false;
}

/** Object returned after searching the tree using negamax */
export class NegamaxResult<M> extends SearchResult<M> {}
