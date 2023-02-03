import { Tree } from "./tree.js";
import { Node, NodeAim } from "./node.js";
import { EvaluateNodeFunc } from "./interfaces.js";
import { SearchExit, SearchMethod, SearchOpts, SearchResult } from "./search.js";
import { bubbleSort, bubbleSortEfficient, defaultSort, SortMethod } from "./sorting.js";

/**
 * Extends the tree class with function specifically for minimax searches
 */
export class SearchTree<GS, M, D> extends Tree<GS, M, D> {
    /** Tracks whether a searched has expired due to time */
    protected expired = false;
    /** Time the search will expire. 0 disables expiry */
    protected expireTime = 0;
    /** Flags that full depth has *not* been reached when set to false*/
    protected fullDepth = true;
    /** Enables presort of children internally */
    protected presortEnable = false;
    /** Number of leaf or depth = 0 reached during current call */
    protected outcomes = 0;
    constructor(root: Node<GS, M, D>, public opts: SearchOpts = new SearchOpts()) {
        super(root);
    }

    EvaluateNode: EvaluateNodeFunc<GS, M, D> = (node: Node<GS, M, D>) => {
        if (!isNaN(node.value)) {
            return node.value;
        } else {
            throw Error("Value has not been defined");
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected evalDepth(depth = this.opts.depth): SearchResult<M> {
        throw Error("evalDepth not implemented");
    }

    /**
     * Searches the tree repeatedly, incrementing the depth each time.
     * Returns after reaching target depth, or early if tree is complete or time exceeded.
     * ### Relevant {@link Negamax.opts | options}
     * - {@link NegamaxOpts.depth} | Maximum depth to search for. 0 for unlimited
     * - {@link NegamaxOpts.timeout} | Maximum time to search for. 0 for unlimited
     * - {@link NegamaxOpts.pruning}
     * - {@link NegamaxOpts.initialDepth}
     * - {@link NegamaxOpts.genBased} (Only if {@link NegamaxOpts.pruning} is not {@link PruningType.NONE})
     * - {@link NegamaxOpts.postsort}
     * - {@link NegamaxOpts.presort}
     *
     * @param depth Overide the depth parameter set in {@link Negamax.opts}
     * @returns The result of the search
     */
    protected evalDeepening(): SearchResult<M> {
        // Get maximum depth
        const max_depth = this.opts.depth ? this.opts.depth : Infinity;
        // Set pre/post sort flags
        this.presortEnable = this.opts.presort;
        // Iterate through depths
        for (let activeDepth = this.opts.initialDepth; ; activeDepth++) {
            const result = this.evalDepth(activeDepth);
            this.depthCallback(this, result);
            if (result.exit == SearchExit.FULL_DEPTH || result.exit == SearchExit.TIME || activeDepth == max_depth) {
                return result;
            }
        }
    }
    /**
     * Search the tree according to the options specified by {@link Negamax.opts}
     * @returns Result from the tree search
     */
    evaluate(): SearchResult<M> {
        switch (this.opts.method) {
            case SearchMethod.DEPTH:
                this.expireTime = 0;
                return this.evalDepth();
            case SearchMethod.DEEPENING:
                // Don't use time related settings
                this.expireTime = 0;
                return this.evalDeepening();
            case SearchMethod.TIME:
                // Calculate timeout and set flag
                if (this.opts.timeout > 0) {
                    this.expireTime = Date.now() + this.opts.timeout;
                    this.expired = false;
                } else {
                    this.expireTime = 0;
                }
                return this.evalDeepening();
            default:
                return this.evalDepth();
        }
    }

    /**
     *  Called during deepening search between each depth
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    depthCallback(tree: SearchTree<GS, M, D>, result: SearchResult<M>): void {
        //
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
    protected getChildren(node: Node<GS, M, D>): Iterable<Node<GS, M, D>> {
        if (this.opts.genBased) {
            // Get moves if not already on node
            if (!node.moves.length) {
                node.moves = this.GetMoves(node);
            } else if (this.presortEnable) {
                this.sortChildren(node);
            }
            return this.childGen(node);
        } else {
            // Create children if required
            // sort enabled and children already present
            if (!this.createChildren(node)) {
                // Children already created, sort by inherited value
                if (this.presortEnable) {
                    this.sortChildren(node);
                }
            }
            return node.children;
        }
    }

    /**
     * Sorts the child nodes of given node according to inherited value, descending.
     * @param node Node of children to sort
     * @returns The child with the highest value
     */
    protected sortChildren(node: Node<GS, M, D>, reverse?: boolean): Node<GS, M, D> {
        if (reverse == undefined) {
            switch (node.aim) {
                case NodeAim.MAX:
                    reverse = false;
                    break;
                case NodeAim.MIN:
                    reverse = true;
                    break;
                default:
                    return node.children[0];
            }
        }

        switch (this.opts.sortMethod) {
            case SortMethod.DEFAULT:
                defaultSort(node.children, reverse);
                break;
            case SortMethod.BUBBLE:
                bubbleSort(node.children, reverse);
                break;
            case SortMethod.BUBBLE_EFFICIENT:
                bubbleSortEfficient(node.children);
                break;
        }

        return node.children[0];
    }

    /** Generator that yields all the nodes along the optimal
     * path, starting from and including `node` */
    protected *routeGen(node: Node<GS, M, D>): Generator<Node<GS, M, D>> {
        yield node;
        while (node.child != undefined) {
            node = node.child;
            yield node;
        }
    }
    /** Generator that yields all the moves along the optimal path  */
    protected *optimalMoveGen(node: Node<GS, M, D>): Generator<M> {
        for (const child of this.routeGen(node)) {
            yield child.move;
        }
    }

    /**
     * @returns A list of moves from the active root {@link Node} that represent the optimal sequence through the game.
     */
    getOptimalMoves(): M[] {
        return [...this.optimalMoveGen(this.activeRoot)];
    }
}
