import { Node } from "../tree/node.js";

export function validateDescendants<GS, M, D>(node: Node<GS, M, D>): number {
    //
    if (node.children.length == 0) {
        return 1;
    } else {
        let descendantCount = node.children.reduce((a, b) => a + validateDescendants(b), 0);
        if (descendantCount == node.descendantCount) {
            return descendantCount + 1;
        } else {
            throw new Error("Node descendant mismatch");
        }
    }
}
