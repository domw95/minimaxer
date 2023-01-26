import { Node } from "./node.js";

export function printNodeIDs(node: Node<unknown, unknown, unknown>, depth = -1) {
    if (depth != 0) {
        for (const child of node.children) {
            printNodeIDs(child, depth - 1);
        }
    }

    console.log(node.uuid);
}

export function drawTree(node: Node<unknown, unknown, unknown>, depth = -1): string {
    let tree_string = "";
    if (depth >= 1) {
        // Draw connections to all children
        for (const child of node.children) {
            tree_string += "N" + node.uuid.toString() + "-->" + "N" + child.uuid.toString() + "((0))\n";
        }
    }
    for (const child of node.children) {
        tree_string += drawTree(child, depth - 1);
    }

    return tree_string;
}
