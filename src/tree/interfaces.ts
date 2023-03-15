import { Node } from "./node.js";
/**
 * Callback for getting a reference to all possible moves from a gamestate.
 * 
 * @see [Example implementation](https://github.com/domw95/minimaxer/blob/main/examples/games/tictactoe.ts#L98)
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
 * @see [Example implementation](https://github.com/domw95/minimaxer/blob/main/examples/games/tictactoe.ts#L103)
 * 
 * @param parent Parent node to create child from
 * @param move Move used to create child
 * @returns Child node
 */
export interface CreateChildNodeFunc<GS, M, D> {
    (parent: Node<GS, M, D>, move: M): Node<GS, M, D>;
}

/**
 * Callback to evaluate the value of the gamestate attached to the node
 * @see [Example implementation](https://github.com/domw95/minimaxer/blob/main/examples/games/tictactoe.ts#L118)
 * @param node Node to evaluate
 * @returns Perceived value of the node
 */
export interface EvaluateNodeFunc<GS, M, D> {
    (node: Node<GS, M, D>): number;
}

/**
 * Callback for maxn evaluation to return an array of scores for node
 * 
 * **===== Not currently used =======**
 * 
 */
export interface GetScoresFunc<GS, M, D> {
    (node: Node<GS, M, D>): void;
}
