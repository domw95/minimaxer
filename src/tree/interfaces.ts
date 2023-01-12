import { Node } from "./node.js";
/**
 * Callback for getting a reference to all possible moves from a gamestate.
 *
 * @param gamestate Generic gamestate of current node
 * @returns An array of moves
 */
export interface GetMovesFunc<GS, M> {
    (gamestate: GS): Array<M>;
}

/**
 * Callback for creating a {@link Node} from a parent and a move
 * Function should clone gamestate, apply move
 *
 */
export interface CreateChildNodeFunc<GS, M> {
    (gamestate: GS, move: M): Node<GS, M>;
}

/**
 * Callback to evaluate the value of the gamestate attached to the node
 */
export interface EvaluateGamestateFunc<GS> {
    (gamestate: GS): number;
}
