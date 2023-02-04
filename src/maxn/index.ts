import { SearchOpts, SearchResult } from "../tree/search.js";
import { Node, NodeAim, NodeType } from "../tree/node.js";

/** Options unique to minimax to change its behaviour */
export class MaxnOpts extends SearchOpts {}

/** Object returned after searching the tree using negamax */
export class MaxnResult<M> extends SearchResult<M> {}

/** Extension of standard node with some extra features */
export class MaxnNode<GS, M, D> extends Node<GS, M, D> {
    /** Player to play turn from this node */
    activePlayer = 0;
    /** Array of scores for each player at this node */
    scores: number[] = [];
}
