import { MaxnNode } from "../maxn/index.js";
import { Node } from "./node.js";
/**
 * Callback for getting a reference to all possible moves from a gamestate.
 *
 * @param gamestate Generic gamestate of current node
 * @returns An array of moves
 */
export interface GetMovesFunc<GS, M, D> {
    (parent: Node<GS, M, D>): Array<M>;
}

/**
 * Callback for creating a {@link Node} from a parent and a move
 * Function should clone gamestate, apply move
 *
 */
export interface CreateChildNodeFunc<GS, M, D> {
    (parent: Node<GS, M, D>, move: M): Node<GS, M, D>;
}

/**
 * Callback to evaluate the value of the gamestate attached to the node
 */
export interface EvaluateNodeFunc<GS, M, D> {
    (node: Node<GS, M, D>): number;
}

/**
 * Callback for maxn evaluation to return an array of scores for node
 */
export interface GetScoresFunc<GS, M, D> {
    (node: MaxnNode<GS, M, D>): void;
}
