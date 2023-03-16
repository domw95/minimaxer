import { SearchOpts, SearchResult } from "../tree/search.js";

/**
 * Class to control the behaviour of maxn search.
 * @category Maxn
 */
export class MaxnOpts extends SearchOpts {}

/**
 * Object returned after searching the tree using maxn.
 * @category Maxn
 */
export class MaxnResult<M> extends SearchResult<M> {}
