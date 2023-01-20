import { SearchExit, SearchOpts } from "../tree/search.js";

/** Options to configure the behaviour of the negamax search */
export class NegamaxOpts extends SearchOpts {
    optimal = false;
}

/** Object returned after searching the tree using negamax */
export class NegamaxResult<M> {
    /**
     * @param exit Reason the search has stopped and result returned.
     * @param move The best move from the {@link Tree.activeRoot}.
     * @param value Value of {@link Tree.activeRoot} according to search
     * @param depth Depth reached and fully searched
     * @param outcomes Number of nodes at bottom of tree (not neccessarily leaves).
     * @param nodes  Number of nodes in full tree
     * @param pathLength Minimum number of moves until a leaf node
     */
    constructor(
        public exit: SearchExit,
        public move: M,
        public value: number,
        public depth: number,
        public outcomes: number,
        public nodes: number,
        public pathLength: number,
    ) {}
}
