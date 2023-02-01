import { Node } from "./node.js";

/**
 * Determines which method is used to sort nodes
 */
export const enum SortMethod {
    /** Built in sort */
    DEFAULT,
    /** Bubble sort */
    BUBBLE,
    /** Bubble that avoids nodes that havent been updated */
    BUBBLE_EFFICIENT,
}

// Sort function that includes path length in selection
function sortFuncPrune(a: Node<unknown, unknown, unknown>, b: Node<unknown, unknown, unknown>): number {
    if (b.inheritedDepth == a.inheritedDepth) {
        // Only care if values are the same
        if (b.inheritedValue == a.inheritedValue) {
            if (b.inheritedValue >= 0) {
                return a.pathLength - b.pathLength;
            } else {
                return b.pathLength - a.pathLength;
            }
        } else {
            return b.inheritedValue - a.inheritedValue;
        }
    } else if (b.inheritedDepth > a.inheritedDepth) {
        return 1;
    } else {
        return 0;
    }
}

function sortFuncNoPrune(a: Node<unknown, unknown, unknown>, b: Node<unknown, unknown, unknown>): number {
    if (b.inheritedDepth == a.inheritedDepth) {
        return b.inheritedValue - a.inheritedValue;
    } else {
        return Number(b.inheritedDepth > a.inheritedDepth);
    }
}

function sortFuncNoPruneSimple(a: Node<unknown, unknown, unknown>, b: Node<unknown, unknown, unknown>) {
    return b.inheritedValue - a.inheritedValue;
}

export function defaultSort(list: Node<unknown, unknown, unknown>[], pruneByPathLength = false) {
    let sortFunc = sortFuncNoPrune;
    if (pruneByPathLength) {
        sortFunc = sortFuncPrune;
    }
    list.sort(sortFunc);
}
// Sort using bubblesort
export function bubbleSort(list: Node<unknown, unknown, unknown>[], pruneByPathLength = false) {
    let sortFunc = sortFuncNoPrune;
    if (pruneByPathLength) {
        sortFunc = sortFuncPrune;
    }
    for (;;) {
        // Mark as not changed for this pass
        let changed = false;
        // Iterate through list
        for (let i = 1; i < list.length; i++) {
            // Get a and b children
            const a = list[i - 1];
            const b = list[i];
            // Switch if neccesary
            const sort = sortFunc(a, b);
            // Returns positive if b should switch with a
            if (sort > 0) {
                list[i - 1] = b;
                list[i] = a;
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
}

// Sort using bubblesort, stopping at nodes that havent been updated
export function bubbleSortEfficient(list: Node<unknown, unknown, unknown>[], pruneByPathLength = false) {
    for (;;) {
        // Mark as not changed for this pass
        let changed = false;
        // Iterate through list
        for (let i = 1; i < list.length; i++) {
            // Get a and b children
            const a = list[i - 1];
            const b = list[i];
            // Check if reached un updated nodes
            if (b.inheritedDepth - a.inheritedDepth < 0) {
                // Stop this iteration
                break;
            }
            // Returns positive if b should switch with a
            if (b.inheritedValue - a.inheritedValue > 0) {
                list[i - 1] = b;
                list[i] = a;
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
}
