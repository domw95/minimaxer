/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { add, complete, configure, cycle, save, suite } from "benny";
import { Node, NodeAim, NodeType } from "../dist/tree/node.js";
import { GetMovesFunc, CreateChildNodeFunc, EvaluateGamestateFunc } from "../dist/index.js";

const number_of_moves = 1e2;

const getMovesCallback: GetMovesFunc<number, number> = (gamestate: number) => {
    return Array(number_of_moves).fill(-1);
};

const createChildCallback: CreateChildNodeFunc<number, number> = (
    gamestate: number,
    move: number,
): Node<number, number> => {
    gamestate += move;
    if (gamestate == 0) {
        return new Node(NodeType.LEAF, gamestate);
    } else {
        return new Node(NodeType.INNER, gamestate);
    }
};

const evaluateGamestateCallback: EvaluateGamestateFunc<number> = (gamestate): number => {
    return gamestate;
};

function createChildrenFor(node: Node<number, number>): boolean {
    let n_moves = node.moves.length;
    // Get moves for nodes if not already there
    if (n_moves == 0) {
        node.moves = getMovesCallback(node.gamestate);
        n_moves = node.moves.length;
    }

    node.children = new Array(n_moves);
    // Create all child nodes
    for (let i = 0; i < n_moves; i++) {
        const child = createChildCallback(node.gamestate, node.moves[i]);
        child.parent = node;
        node.children[i] = child;
    }
    return true;
}

function createChildrenMap(node: Node<number, number>): boolean {
    let n_moves = node.moves.length;
    // Get moves for nodes if not already there
    if (n_moves == 0) {
        node.moves = getMovesCallback(node.gamestate);
        n_moves = node.moves.length;
    }

    // Create all child nodes
    node.children = node.moves.map<Node<number, number>>((move) => {
        const child = createChildCallback(node.gamestate, move);
        child.parent = node;
        return child;
    });

    return true;
}

function createChildrenForEach(node: Node<number, number>): void {
    let n_moves = node.moves.length;
    // Get moves for nodes if not already there
    if (n_moves == 0) {
        node.moves = getMovesCallback(node.gamestate);
        n_moves = node.moves.length;
    }

    //
    node.moves.forEach((move) => {
        const child = createChildCallback(node.gamestate, move);
        child.parent = node;
        node.children.push(child);
    });
}

suite(
    "Child creation",
    // add("Slow", () => {
    //     const node: Node<number, number> = new Node(NodeType.ROOT, 100);
    //     createChildrenSlow(node);
    // }),
    add("Map", () => {
        const node: Node<number, number> = new Node(NodeType.ROOT, 100);
        createChildrenMap(node);
    }),

    add("For", () => {
        const node: Node<number, number> = new Node(NodeType.ROOT, 100);
        createChildrenFor(node);
    }),
    add("ForEach", () => {
        const node: Node<number, number> = new Node(NodeType.ROOT, 100);
        createChildrenForEach(node);
    }),
    add("Map", () => {
        const node: Node<number, number> = new Node(NodeType.ROOT, 100);
        createChildrenMap(node);
    }),

    add("For", () => {
        const node: Node<number, number> = new Node(NodeType.ROOT, 100);
        createChildrenFor(node);
    }),
    add("ForEach", () => {
        const node: Node<number, number> = new Node(NodeType.ROOT, 100);
        createChildrenForEach(node);
    }),

    cycle(),
    cycle(),
    cycle(),

    complete(),

    save({
        file: "child_creation_" + number_of_moves.toString() + "_moves",
        folder: "benchmarks/results",
    }),
);
