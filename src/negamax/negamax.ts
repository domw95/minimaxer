import { Tree } from "../tree/tree.js";
import { Node, NodeAim, NodeType } from "../tree/node.js";
import { NegamaxOpts, NegamaxResult } from "./index.js";
import { PruningType, SearchExit } from "../tree/search.js";

/**
 * For deterministic zero-sum 2 player games with alternating turns and full game knowledge.
 * Can be configured to do depth based, time based and deepening searches,
 * with or without alpha-beta pruning and other optimisations.
 */
export class Negamax<GS, M, D> extends Tree<GS, M, D> {
    /** Search options.
     * @see {@link Negamax.evalDepth}
     * @see {@link Negamax.evalDeepening}
     * @see {@link Negamax.evalTime}*/
    opts: NegamaxOpts = new NegamaxOpts();
    /** Tracks whether a searched has expired due to time */
    protected expired = false;
    /** Time the search will expire. 0 disables expiry */
    protected expireTime = 0;
    /** Flags that full depth has *not* been reached when set to false*/
    protected fullDepth = true;
    /** Enables postsort of children internally */
    protected postsortEnable = false;
    /** Enables presort of children internally */
    protected presortEnable = false;
    /** Number of leaf or depth = 0 reached during current call */
    protected outcomes = 0;

    /**
     *
     * @param gamestate Gamestate for root node.
     * @param aim The aim of the player in the current gamestate {@link NodeAim}.
     * @param GetMovesFunc callback function to get moves of a gamestate.
     * @param CreateChildNodeFunc callback to create {@link Node} from gamestate and move.
     * @param EvaluateGamestateFunc callback to return a value for a gamestate.
     * @param opts Control the behaviour of the negamax search
     */
    constructor(gamestate: GS, aim: NodeAim, opts: NegamaxOpts, moves?: M[]) {
        super(gamestate, aim, moves);
        if (opts != undefined) {
            this.opts = opts;
        }
    }

    /**
     * Searches the tree up to a certain depth.
     * Returns after reaching depth, or early if tree is complete.
     * ### Relevant {@link Negamax.opts | options}
     * - {@link NegamaxOpts.depth} (Overidden by *depth* argument)
     * - {@link NegamaxOpts.pruning}
     * - {@link NegamaxOpts.initialDepth}
     * - {@link NegamaxOpts.genBased} (Only if {@link NegamaxOpts.pruning} is not {@link PruningType.NONE})
     * - {@link NegamaxOpts.postsort}
     * - {@link NegamaxOpts.presort}
     *
     * @param depth Overide the depth parameter set in {@link Negamax.opts}
     * @returns The result of the search
     */
    evalDepth(depth = this.opts.depth): NegamaxResult<M> {
        // reset stats
        this.outcomes = 0;
        this.activeDepth = depth;
        // reset fullDepth flag
        this.fullDepth = true;
        // Call negamax to depth
        const exit = this.negamax(this.activeRoot, depth, this.activeRoot.aim, -Infinity, Infinity, Infinity, Infinity);
        // return result
        return new NegamaxResult<M>(
            exit,
            this.activeRoot.child?.move as M,
            -this.activeRoot.aim * this.activeRoot.inheritedValue,
            depth,
            this.outcomes,
            this.nodeCount,
            this.activeRoot.pathLength,
        );
    }

    /**
     * Searches the tree until a timeout occurs.
     * Returns after timeout, or early if tree is complete.
     * ### Relevant {@link NegamaxOpts | options}
     * - {@link NegamaxOpts.timeout} (Overidden by *timeout* argument)
     * - {@link NegamaxOpts.pruning}
     * - {@link NegamaxOpts.initialDepth}
     * - {@link NegamaxOpts.genBased} (Only if {@link NegamaxOpts.pruning} is not {@link PruningType.NONE})
     * - {@link NegamaxOpts.postsort}
     * - {@link NegamaxOpts.presort}
     *
     * @param timeout Override the timeout parameter set in {@link Negamax.opts}
     * @returns The result of the search
     */
    evalTime(timeout = this.opts.timeout): NegamaxResult<M> {
        // Calculate timeout and set flag
        this.expireTime = Date.now() + timeout;
        this.expired = false;
        // Set pre/post sort flags
        this.presortEnable = this.opts.presort;
        this.postsortEnable = this.opts.postsort;

        // Iterate through depths until timeout or full tree
        for (let activeDepth = this.opts.initialDepth; ; activeDepth++) {
            const result = this.evalDepth(activeDepth);
            if (result.exit == SearchExit.FULL_DEPTH || result.exit == SearchExit.TIME) {
                return result;
            }
            this.depthCallback(this, result);
        }
    }

    /**
     * Searches the tree repeatedly, incrementing the depth each time.
     * Returns after reaching target depth, or early if tree is complete.
     * ### Relevant {@link Negamax.opts | options}
     * - {@link NegamaxOpts.depth} (Overidden by *depth* argument)
     * - {@link NegamaxOpts.pruning}
     * - {@link NegamaxOpts.initialDepth}
     * - {@link NegamaxOpts.genBased} (Only if {@link NegamaxOpts.pruning} is not {@link PruningType.NONE})
     * - {@link NegamaxOpts.postsort}
     * - {@link NegamaxOpts.presort}
     *
     * @param depth Overide the depth parameter set in {@link Negamax.opts}
     * @returns The result of the search
     */
    evalDeepening(depth: number = this.opts.depth): NegamaxResult<M> {
        // Don't use time related settings
        this.expireTime = 0;
        // Set pre/post sort flags
        this.presortEnable = this.opts.presort;
        this.postsortEnable = this.opts.postsort;
        // Iterate through depths
        for (let activeDepth = this.opts.initialDepth; ; activeDepth++) {
            const result = this.evalDepth(activeDepth);
            this.depthCallback(this, result);
            if (result.exit == SearchExit.FULL_DEPTH || activeDepth == depth) {
                return result;
            }
        }
    }

    // Function called during time based and deepening in between successive
    // calls to further depths fo search
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    depthCallback(tree: Negamax<GS, M, D>, result: NegamaxResult<M>): void {
        //
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
     * @param alpha minimum guarenteed score
     * @param beta maximum guarenteed score from minimising player above
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
            let value = -Infinity;
            let bestChild: Node<GS, M, D> | undefined;

            switch (this.opts.pruning) {
                case PruningType.NONE:
                    // Iterate through node children
                    for (const child of this.getChildren(node, depth)) {
                        // score is assigned directly to child, exit if timeout
                        exit = this.negamax(child, depth - 1, -colour, -beta, beta_path, -alpha, alpha_path);
                        if (exit == SearchExit.TIME) {
                            return SearchExit.TIME;
                        }
                    }
                    break;

                case PruningType.ALPHA_BETA:
                    // Iterate through node children
                    for (const child of this.getChildren(node, depth)) {
                        // score is assigned directly to child, exit if timeout
                        exit = this.negamax(child, depth - 1, -colour, -beta, beta_path, -alpha, alpha_path);
                        if (exit == SearchExit.TIME) {
                            return SearchExit.TIME;
                        }
                        // get best value with pathlength
                        if (child.inheritedValue > value) {
                            value = child.inheritedValue;
                            alpha_path = child.pathLength;
                            bestChild = child;
                            //  Update alpha
                            alpha = Math.max(value, alpha);
                        } else if (child.inheritedValue == value) {
                            // Check if winning
                            if (value > 0) {
                                // Get the shortest path
                                if (child.pathLength < alpha_path) {
                                    alpha_path = child.pathLength;
                                    bestChild = child;
                                }
                            } else {
                                // get the longest path as negative evaluation
                                if (child.pathLength > alpha_path) {
                                    alpha_path = child.pathLength;
                                    bestChild = child;
                                }
                            }
                        } else {
                            continue;
                        }
                        // If alpha is greater than beta, this node will never be reached
                        if (alpha > beta) {
                            break;
                        } else if (alpha == beta) {
                            // Need to check path length
                            // If alpha is positive, minimiser wont select if path is short
                            if (alpha >= 0 && alpha_path <= beta_path) {
                                break;
                                // If alpha is negative, minimiser goes for quick win
                            } else if (alpha < 0 && alpha_path >= beta_path) {
                                break;
                            }
                        }
                    }
                    break;
            }

            // Assign the best child (and postsort if enabled)
            this.assignBestChild(node, bestChild);
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
            if (this.fullDepth) {
                return SearchExit.FULL_DEPTH;
            } else {
                return SearchExit.DEPTH;
            }
        } else {
            node.pathLength = 1;
            this.fullDepth = false;
            return SearchExit.DEPTH;
        }
    }

    /**
     * Checks if expiry is enable and has happened
     * @returns `true` if time has expired, otherwise `false`
     */
    protected checkExpiry(): boolean {
        if (this.expireTime) {
            if (this.expired) {
                return true;
            } else if (Date.now() > this.expireTime) {
                this.expired = true;
                return true;
            }
        }
        return false;
    }

    /**
     * Returns either the array of node children or a generator which may create children on the fly
     * Also presorts children if enabled
     * @param node Node to return an iterable of children
     * @returns An iterable for going through children of node
     */
    protected getChildren(node: Node<GS, M, D>, depth: number): Iterable<Node<GS, M, D>> {
        if (this.opts.genBased) {
            // Get moves if not already on node
            if (!node.moves.length) {
                node.moves = this.GetMoves(node.gamestate);
            } else if (this.presortEnable) {
                this.sortChildren(node);
            }
            return this.childGen(node);
        } else {
            // Create children if required
            // sort enabled and children already present
            if (!this.createChildren(node) && this.presortEnable && depth > 1) {
                this.sortChildren(node);
            }
            return node.children;
        }
    }

    /**
     * Gets the best child of `node`, assigns and sorts children if postsort is enabled
     * @param node Node to find best child of
     */
    protected assignBestChild(node: Node<GS, M, D>, bestChild?: Node<GS, M, D>): void {
        // Find the best child
        if (this.postsortEnable) {
            // sort children and pick best
            node.child = this.sortChildren(node);
        } else if (bestChild !== undefined) {
            node.child = bestChild;
        } else {
            node.child = this.bestChild(node);
        }
        node.inheritedValue = -node.child.inheritedValue;
        node.inheritedDepth = this.activeDepth;
        node.pathLength = node.child.pathLength + 1;
    }
}
