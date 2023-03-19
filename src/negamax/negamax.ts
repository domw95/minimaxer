import { Node, NodeType } from "../tree/node.js";
import { NegamaxOpts, NegamaxResult } from "./index.js";
import { PruningType, SearchExit } from "../tree/search.js";
import { SearchTree } from "../tree/searchtree.js";
import { bubbleSortEfficient } from "../tree/sorting.js";

/**
 * For deterministic zero-sum 2 player games with alternating turns and full game knowledge.
 * Can be configured to do depth based, time based and deepening searches,
 * with a number of tuning options.
 *
 * For an example implementation, see the
 * [mancala game and required callback function](https://github.com/domw95/minimaxer/blob/main/examples/games/mancala.ts)
 * and the
 * [usage](https://github.com/domw95/minimaxer/blob/main/examples/minimax_mancala.ts).
 *
 * For configuring the search options, see the {@link NegamaxOpts} page.
 * 
 * ## Usage
 * To search the game tree from a game state involves creating a root {@link Node}, creating
 * the {@link Negamax} tree with the root, attaching callbacks and then evaluating.
 * 
 * ### Setting up
 * ```ts
 * import * as mx from minimaxer
 * // Gamestate defined elsewhere
 * const gamestate = new Gamestate():
 * // root node and tree
 * const root = new mx.Node(mx.NodeType.ROOT, gamestate.clone(), 0, 0, mx.NodeAim.MAX);
 * const negamax = new mx.Negamax(root);
 * // callbacks (defined elsewhere)
 * negamax.CreateChildNode = createChildCallback;
 * negamax.GetMoves = getMovesCallback;
 * negamax.EvaluateNode = evaluateNodeCallback;
 * ```
 * 
 * The 3rd argument `0` is the move used to get to this node but the value does not matter as it
 * is the root node. The 4th is the data, not used here, so set to 0.
 * 
 * The 5th argument must be either {@link NodeAim.MAX} or {@link NodeAim.MIN}, depending on
 * whether the player taking the next turn is trying to minimise or maximise the score.
 * 
 * ### Evaluating / searching
 * Search options must be configured as required, then the {@link Negamax.evaluate} function can be called.
 * See {@link NegamaxOpts} for details on the options.
 * 
 * ```ts
 * // continuing from above ^^
 * negamax.opts.method = mx.SearchMethod.TIME;
 * negamax.opts.timeout = 100 //miliseconds
 * negamax.opts.optimal = true
 * const result = negamax.evaluate();
 * ```
 * The result is of type {@link SearchResult} and the best move and value can be acquired
 * from it, as well as other information about the search process.
 * 
 * ## Implementing callbacks
 * In the following implementations, the (made-up) concrete types of the 3 generic types are:
 * - GS = `Gamestate`
 * - M = `number`
 * - D = `number` (always 0, unused)
 *
 * ### {@link Negamax.GetMoves}
 * The GetMoves callback returns a reference to a list of moves.
 * It may have to generate this list if not done during the {@link Negamax.CreateChildNode} callback.
 *
 * ```ts
 * import * as mx from minimaxer
 *
 * const getMovesCallback: mx.GetMovesFunc<Gamestate, number[], number> = (node): Array<number[]> => {
 *      node.gamestate.generate_moves();
 *      return node.gamestate.moves;
 * };
 * ```
 * The moves list and contained moves are never modified by the search,
 * and must not be modified in any of the other callbacks.
 * 
 * ### {@link Negamax.CreateChildNode}
 * The {@link Negamax.CreateChildNode} callback as a few impnodeortant responsibilites:
 * - Clones the gamestate of the parent node (important so parent gamestate is not modified)
 * - Applies the given move to the cloned gamestate to create the next gamestate
 * - Checks for game end condition,
 * - Returns a node with the correct {@link NodeType}.
 * 
 * **Passing a NodeAim argument to the child node constructor
 * is not required and will be ignored by the negamax algorithm.
 * The actual NodeAim is dervied internally from the root NodeAim**.
 * 
 * ```ts
 * import * as mx from minimaxer
 * 
 * const createChildCallback: mx.CreateChildNodeFunc<Gamestate, Array<number>, number> = (node, move) => {
    // First create a clone of the gamestate
    const new_gamestate = node.gamestate.clone();
    // Apply the move
    new_gamestate.playMove(move);
    // Return a new node with correct node type
    if (new_gamestate.check_end()) {
        return new mx.Node(mx.NodeType.LEAF, new_gamestate, move, 0);
    } else {
        return new mx.Node(mx.NodeType.INNER, new_gamestate, move, 0);
    }
};
```
 * The return type (Node<Gamestate, number, number>) is implied by the function type annotation.
 *
 * If using the {@link Node.data | Node.data} property, the {@link Negamax.CreateChildNode} callback is also responsible
 * for passing that data to the child node, with whatever modification/copying of data is required.
 * 
 * ### {@link Negamax.EvaluateNode}
 * 
 * This callback receives a {@link Node} and evaluates its relative value based on the
 * gamestate and any extra data included on the node.
 * 
 * This is highly game dependant, but may look something like this:
 * ```ts
 * import * as mx from minimaxer
 * 
 * const evaluateGamestateCallback: mx.EvaluateNodeFunc<Gamestate, number[], number> = (node): number => {
    if (node.gamestate.end){
        if (node.gamestate.winner == player0){
            return Infinity;
        } else {
            return -Infinity;
        }
    } else {
        return complex_evaluation_function(node.gamestate);
    }
};
 * ```
 * This function should not modify the node.
 * 
 * ### {@link Negamax.depthCallback}
 * This callback is optional and a little different to the other 3. 
 * It is called on every depth of search
 * when using the {@link SearchMethod.DEEPENING} 
 * or {@link SearchMethod.TIME} based {@link SearchMethod | search methods}.
 * 
 * It passes the full tree ({@link Negamax} class instance) and the {@link SearchResult}
 * for that depth as arguments. It is most useful for printing out the current
 * state of the search during the iterative deepening process
 * 
 * ```ts
 * const negamax = new Negamax(*args*);
 * 
 * negamax.depthCallback = (tree, result) => {
 *      console.log(result);
 * }
 * ```
 *  Doing any long processes in this function will hold up the search, and it cannot
 * update the DOM before the search has finished.
 * 
 * ## Advanced usage
 * ### Removing the {@link Negamax.GetMoves} callback
 * The {@link Negamax.GetMoves} callback can be omitted if the root node is initialised with an array of moves
 * and if the {@link Negamax.CreateChildNode} callback assigns a list of moves to the created child.
 * 
 * The may be useful if the game state already has a list of moves in the process of creating the
 * child node, either from playing the previous move or by checking for an end condition.
 * 
 * **Do not do this if extra computation is required to create a list of moves**.
 * 
 * ```ts
 * const root = new mx.Node(mx.NodeType.ROOT, gamestate.clone(), 0, 0, mx.NodeAim.MAX, gamestate.moves);
 * ```
 * ```ts
 * import * as mx from minimaxer
 * 
 * const createChildCallback: mx.CreateChildNodeFunc<Gamestate, Array<number>, number> = (node, move) => {
 *     ...
 *     if (new_gamestate.check_end()) {
 *         return new minimax.Node(minimax.NodeType.LEAF, new_gamestate, move, 0, 0, new_gamestate.moves);
 *     } else {
 *         return new minimax.Node(minimax.NodeType.INNER, new_gamestate, move, 0, 0, new_gamestate.moves);
 *     }
 * };
 * ```
 * 
 * ### Removing the {@link Negamax.EvaluateNode} callback
 * The {@link Negamax.EvaluateNode} callback can be removed if the node value is directly assigned during
 * the {@link Negamax.CreateChildNode} callback. This requires first creating the node,
 * then setting the {@link Node.value} property value.
 * 
 * **This should only be done if the evaluation is very quick e.g the difference
 * between 2 scores on the gamestate**.
 * 
 * ### Using the {@link Node.data | Node.data} property
 * The {@link Node.data} property is attached to the root {@link Node} and can then be
 * passed through the tree via the {@link CreateChildNode} callback.
 * 
 * It is most useful for containing evaluation specific information that does not belong on
 * the gamestate. An example is constant evaluation options that can be passed to the
 * evaluation function. Otherwise these would have to be global variables.
 * 
 * It also does not have to be constant and could contain variables to help speed up
 * the evaulation for complex games, by using information from previous turns.
 * 
 * 
 * 
 * The example below shows how a contant "options" object could be used:
 * 
 * ```ts
 * // Class to change evaluation function
 * class EvalOpts {
 *      opt1 = false,
 *      opt2 = 4
 * }
 * 
 * // Modified evaluation function that uses node.data
 * const evaluateGamestateCallback: mx.EvaluateNodeFunc<Gamestate, number[], EvalOpts> = (node): number => {
    if (node.gamestate.end){
        if (node.gamestate.winner == player0){
            return Infinity;
        } else {
            return -Infinity;
        }
    } else {
        if (node.data.opt1){
            return complex_evaluation_function(node.gamestate);
        } else {
            return node.data.opt2 * simple_evaluation_function(node.gamestate);
        }   
    }
};

// Modifed create child function that passes data to child
const createChildCallback: mx.CreateChildNodeFunc<Gamestate, Array<number>, number> = (node, move) => {
    // First create a clone of the gamestate
    const new_gamestate = node.gamestate.clone();
    // Apply the move
    new_gamestate.playMove(move);
    // Return a new node with correct node type
    if (new_gamestate.check_end()) {
        return new mx.Node(mx.NodeType.LEAF, new_gamestate, move, node.gamestate.data);
    } else {
        return new mx.Node(mx.NodeType.INNER, new_gamestate, move, node.gamestate.data);
    }
};

 * 
 * const gamestate = new Gamestate():
 * // root node and tree that ises EvalOpts as D type
 * const root = new mx.Node(mx.NodeType.ROOT, gamestate.clone(), 0, new EvalOpts(), mx.NodeAim.MAX);
 * const negamax = new mx.Negamax(root);
 * // callbacks (defined elsewhere)
 * negamax.CreateChildNode = createChildCallback;
 * negamax.GetMoves = getMovesCallback;
 * negamax.EvaluateNode = evaluateNodeCallback;
 * 
 * ```
 *
 * @typeParam GS - The object representing the state of the game
 * @typeParam M - The object representing a move in the game
 * @typeParam D - Extra data used in evaluation not suitable for storing in the gamestate
 * @category Negamax
 */
export class Negamax<GS, M, D> extends SearchTree<GS, M, D> {
    /** Search options.*/
    opts: NegamaxOpts = new NegamaxOpts();

    /**
     * @param root Root to start the
     * @param opts Control the behaviour of the negamax search
     *
     */
    constructor(root: Node<GS, M, D>, opts: NegamaxOpts = new NegamaxOpts()) {
        super(root, opts);
        this.opts = opts;
    }

    /**
     * Searches the tree up to a certain depth.
     * Returns after reaching depth, or early if tree is complete.
     * ### Relevant {@link Negamax.opts | options}
     * - {@link NegamaxOpts.depth} (Overidden by *depth* argument)
     * - {@link NegamaxOpts.pruning}
     * - {@link NegamaxOpts.initialDepth}
     * - {@link NegamaxOpts.genBased} (Only if {@link NegamaxOpts.pruning} is not {@link PruningType.NONE})
     * - {@link NegamaxOpts.presort}
     * - {@link NegamaxOpts.optimal}
     *
     * @param depth Override the depth parameter set in {@link Negamax.opts}
     * @returns The result of the search
     */
    protected evalDepth(depth = this.opts.depth): NegamaxResult<M> {
        // reset stats
        this.outcomes = 0;
        this.activeDepth = depth;
        // reset fullDepth flag
        this.fullDepth = true;
        // Call negamax to depth
        let exit: SearchExit;
        if (this.opts.optimal == false) {
            exit = this.negamax(this.activeRoot, depth, this.activeRoot.aim, -Infinity, Infinity, Infinity, Infinity);
        } else {
            exit = this.negamax_optimal(this.activeRoot, depth, this.activeRoot.aim, -Infinity, Infinity);
        }

        // Default best is the one assigned to root
        let best = this.activeRoot.child as Node<GS, M, D>;

        // Select random best if enabled
        if (this.opts.randomBest && exit != SearchExit.TIME) {
            // Get randomly selected best move
            best = this.randomBestChild(this.activeRoot);
        } else if (this.opts.randomWeight && exit != SearchExit.TIME) {
            // Get weighted random best move
            best = this.randomWeightedChild(this.activeRoot, this.opts.randomWeight);
        }

        // return result
        return new NegamaxResult<M>(
            exit,
            best.move,
            this.activeRoot.aim * best.inheritedValue,
            depth,
            this.outcomes,
            this.nodeCount,
            this.activeRoot.pathLength,
        );
    }

    /**
     * Implements the negamax algorithm up to a given depth of search.
     * Recursively calls itself until `depth` is `0` or {@link NodeType.LEAF} node is reached and evaluated.
     * Node values are then passed back up the tree according to the {@link NodeAim} of the parent nodes.
     *
     * The `colour` arguments alternates between `1` and `-1`, as the node aim alternates between {@link NodeAim.MAX} and {@link NodeAim.MIN}.
     * This changes the sign of the value applied to node depending on the aim of the parent.
     * Selection of the best child can then be done based on the maximum node value.
     *
     * Returns early if timeout occurs
     *
     * @param node Node to evaluate or search children
     * @param depth Depth to search from this node
     * @param colour `1` for {@link NodeAim.MAX}, `-1` for {@link NodeAim.MIN}
     * @param alpha minimum guaranteed score
     * @param alpha_path Best guaranteed path
     * @param beta maximum guaranteed score from minimising player
     * @param beta_path Best guaranteed path for minimising player
     * @returns `false` if time expired during search, `true` if search should continue
     */
    protected negamax(
        node: Node<GS, M, D>,
        depth: number,
        colour: number,
        alpha: number,
        alpha_path: number,
        beta: number,
        beta_path: number,
    ): SearchExit {
        // Mark node as not pruned before starting search
        node.pruned = false;
        // Check if this node should be assigned a direct value
        if (node.type == NodeType.LEAF) {
            return this.assignNodeValue(node, depth, colour, true);
        } else if (depth == 0) {
            return this.assignNodeValue(node, depth, colour, false);
        } else {
            // Check expiry
            if (this.checkExpiry()) {
                return SearchExit.TIME;
            }

            let exit = SearchExit.FULL_DEPTH;
            let best: Node<GS, M, D> | undefined;

            switch (this.opts.pruning) {
                case PruningType.NONE:
                    // Iterate through node children
                    for (const child of this.getChildren(node)) {
                        // score is assigned directly to child, exit if timeout
                        exit = this.negamax(child, depth - 1, -colour, -beta, beta_path, -alpha, alpha_path);
                        if (exit == SearchExit.TIME) {
                            return SearchExit.TIME;
                        }
                        if (best == undefined || child.inheritedValue > best.inheritedValue) {
                            best = child;
                        }
                    }
                    break;

                case PruningType.ALPHA_BETA:
                    // Iterate through node children
                    for (const child of this.getChildren(node)) {
                        // score is assigned directly to child, exit if timeout
                        exit = this.negamax(child, depth - 1, -colour, -beta, beta_path, -alpha, alpha_path);
                        if (exit == SearchExit.TIME) {
                            return SearchExit.TIME;
                        }
                        // get best value with pathlength
                        node.pruned ||= child.pruned;
                        if (best == undefined || child.inheritedValue > best.inheritedValue) {
                            alpha_path = child.pathLength;
                            best = child;
                            //  Update alpha
                            alpha = Math.max(best.inheritedValue, alpha);
                        } else if (child.inheritedValue == best.inheritedValue) {
                            // Check if pathlength based pruning is enabled
                            if (!this.opts.pruneByPathLength) {
                                continue;
                            }
                            // Check if winning
                            if (best.inheritedValue > 0) {
                                // Get the shortest path
                                if (child.pathLength < alpha_path) {
                                    alpha_path = child.pathLength;
                                    best = child;
                                }
                            } else {
                                // get the longest path as negative evaluation
                                if (child.pathLength > alpha_path) {
                                    alpha_path = child.pathLength;
                                    best = child;
                                }
                            }
                        } else {
                            continue;
                        }
                        // If alpha is greater than beta, this node will never be reached
                        if (alpha > beta) {
                            node.pruned = true;
                            break;
                        } else if (alpha == beta) {
                            if (!this.opts.pruneByPathLength) {
                                if (!this.opts.randomBest) {
                                    node.pruned = true;
                                    break;
                                }
                            }
                            // Need to check path length
                            // If alpha is positive, minimiser wont select if path is short
                            if (alpha >= 0 && alpha_path <= beta_path) {
                                node.pruned = true;
                                break;
                                // If alpha is negative, minimiser goes for quick win
                            } else if (alpha < 0 && alpha_path >= beta_path) {
                                node.pruned = true;
                                break;
                            }
                        }
                    }
                    break;
            }

            // Assign the best child to parent
            if (best !== undefined) {
                node.child = best;
                node.inheritedValue = -node.child.inheritedValue;
                node.inheritedDepth = this.activeDepth;
                node.pathLength = node.child.pathLength + 1;
            } else {
                throw Error("Failed to find best");
            }
            return exit;
        }
    }

    /**
     * Assigns value to node using eval function.
     * Tracks outcomes count and fulldepth
     * @param node
     * @param depth
     * @param colour
     * @param leaf  `true` if node is a leaf
     */
    protected assignNodeValue(node: Node<GS, M, D>, depth: number, colour: number, leaf: boolean): SearchExit {
        // Get value from function. Assign to inherited as well since at depth/leaf
        node.inheritedValue = -colour * this.EvaluateNode(node);
        node.inheritedDepth = this.activeDepth;
        // Log +1 leaf or depth node
        this.outcomes++;
        // Check if leaf node
        if (leaf) {
            node.pathLength = 0;
            return this.fullDepth ? SearchExit.FULL_DEPTH : SearchExit.DEPTH;
        } else {
            node.pathLength = 1;
            this.fullDepth = false;
            return SearchExit.DEPTH;
        }
    }

    /** Wrapper around default children sort that specifices reverse=`false`*/
    protected sortChildren(node: Node<GS, M, D>): Node<GS, M, D> {
        return super.sortChildren(node, false);
    }
    /**
     * Same as {@link Negamax.negamax} but optimised for best performing options.
     *
     * Runs when {@link NegamaxOpts.optimal} = `true`
     *
     * Runs as:
     * - {@link NegamaxOpts.pruning} = {@link PruningType.ALPHA_BETA}
     * - {@link NegamaxOpts.presort} = `true`
     * - {@link NegamaxOpts.genBased} = `true`
     * - {@link NegamaxOpts.pruneByPathLength} = `false`
     */
    protected negamax_optimal(
        node: Node<GS, M, D>,
        depth: number,
        colour: number,
        alpha: number,
        beta: number,
    ): SearchExit {
        node.pruned = false;
        // Check if this node should be assigned a direct value
        if (node.type == NodeType.LEAF) {
            return this.assignNodeValue(node, depth, colour, true);
        } else if (depth == 0) {
            return this.assignNodeValue(node, depth, colour, false);
        } else {
            // Check expiry
            if (this.checkExpiry()) {
                return SearchExit.TIME;
            }

            let exit = SearchExit.FULL_DEPTH;
            // node.aim = NodeAim.MAX;

            // Get moves if not already on node
            if (!node.moves.length) {
                node.moves = this.GetMoves(node);
            } else {
                // this.sortChildren(node);
                bubbleSortEfficient(node.children);
            }
            const gen = this.childGen(node);
            let best: Node<GS, M, D> | undefined;

            // Iterate through node children
            for (const child of gen) {
                // score is assigned directly to child, exit if timeout
                exit = this.negamax_optimal(child, depth - 1, -colour, -beta, -alpha);
                if (exit == SearchExit.TIME) {
                    return SearchExit.TIME;
                }
                node.pruned ||= child.pruned;
                // get best value with pathlength
                if (best == undefined || child.inheritedValue > best.inheritedValue) {
                    best = child;
                    //  Update alpha
                    alpha = Math.max(best.inheritedValue, alpha);

                    // If alpha is greater than beta, this node will never be reached
                    if (alpha >= beta) {
                        node.pruned = true;
                        break;
                    }
                }
            }
            if (best !== undefined) {
                node.child = best;
                node.inheritedValue = -node.child.inheritedValue;
                node.inheritedDepth = this.activeDepth;
                node.pathLength = node.child.pathLength + 1;
            }
            return exit;
        }
    }
}
