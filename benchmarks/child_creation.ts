/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { add, complete, cycle, save, suite } from "benny";
import { Node, NodeType } from "../dist/tree/node.js";
import { GetMovesFunc, CreateChildNodeFunc } from "../dist/index.js";

const number_of_moves = 1e2;

const getMovesCallback: GetMovesFunc<number, number, unknown> = () => {
    return Array(number_of_moves).fill(-1);
};

const createChildCallback: CreateChildNodeFunc<number, number, unknown> = (
    parent: Node<number, number, unknown>,
    move: number,
): Node<number, number, unknown> => {
    const gamestate = parent.gamestate + move;
    if (gamestate == 0) {
        return new Node(NodeType.LEAF, gamestate, 0, 0);
    } else {
        return new Node(NodeType.INNER, gamestate, 0, 0);
    }
};

function createChildrenFor(node: Node<number, number, unknown>): boolean {
    let n_moves = node.moves.length;
    // Get moves for nodes if not already there
    if (n_moves == 0) {
        node.moves = getMovesCallback(node);
        n_moves = node.moves.length;
    }

    node.children = new Array(n_moves);
    // Create all child nodes
    for (let i = 0; i < n_moves; i++) {
        const child = createChildCallback(node, node.moves[i]);
        child.parent = node;
        node.children[i] = child;
    }
    return true;
}

function createChildrenMap(node: Node<number, number, unknown>): boolean {
    let n_moves = node.moves.length;
    // Get moves for nodes if not already there
    if (n_moves == 0) {
        node.moves = getMovesCallback(node);
        n_moves = node.moves.length;
    }

    // Create all child nodes
    node.children = node.moves.map<Node<number, number, unknown>>((move) => {
        const child = createChildCallback(node, move);
        child.parent = node;
        return child;
    });

    return true;
}

function createChildrenForEach(node: Node<number, number, unknown>): void {
    let n_moves = node.moves.length;
    // Get moves for nodes if not already there
    if (n_moves == 0) {
        node.moves = getMovesCallback(node);
        n_moves = node.moves.length;
    }

    //
    node.moves.forEach((move) => {
        const child = createChildCallback(node, move);
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
        const node = new Node(NodeType.ROOT, 100, 0, 0);
        createChildrenMap(node);
    }),

    add("For", () => {
        const node = new Node(NodeType.ROOT, 100, 0, 0);
        createChildrenFor(node);
    }),
    add("ForEach", () => {
        const node = new Node(NodeType.ROOT, 100, 0, 0);
        createChildrenForEach(node);
    }),
    add("Map", () => {
        const node = new Node(NodeType.ROOT, 100, 0, 0);
        createChildrenMap(node);
    }),

    add("For", () => {
        const node = new Node(NodeType.ROOT, 100, 0, 0);
        createChildrenFor(node);
    }),
    add("ForEach", () => {
        const node = new Node(NodeType.ROOT, 100, 0, 0);
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
