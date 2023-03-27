import { Node } from "./node.js";

/**
 * Determines which method is used to sort nodes
 */
export const enum SortMethod {
    /** Built in sort */
    DEFAULT,
    /** Bubble sort */
    BUBBLE,
    /** Bubble that avoids nodes that havent been updated
     * @see [Better sorting in blog post](https://domwil.co.uk/minimaxer/part4/#child-sorting).
     */
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
    } else {
        return b.inheritedDepth - a.inheritedDepth;
    }
}

// Sort based on inherited depth and value
function sortFuncNoPrune(a: Node<unknown, unknown, unknown>, b: Node<unknown, unknown, unknown>): number {
    if (b.inheritedDepth == a.inheritedDepth) {
        return b.inheritedValue - a.inheritedValue;
    } else {
        return b.inheritedDepth - a.inheritedDepth;
    }
}

// Sort based on inherited depth and reversed value
function sortFuncNoPruneReverse(a: Node<unknown, unknown, unknown>, b: Node<unknown, unknown, unknown>): number {
    if (b.inheritedDepth == a.inheritedDepth) {
        return a.inheritedValue - b.inheritedValue;
    } else {
        return a.inheritedDepth - b.inheritedDepth;
    }
}

// Return the correct search function
function getSortFunc(reverse: boolean, prune: boolean) {
    if (prune) {
        return sortFuncPrune;
    } else {
        if (reverse) {
            return sortFuncNoPruneReverse;
        } else {
            return sortFuncNoPrune;
        }
    }
}

// Sort using in build sort function
export function defaultSort(list: Node<unknown, unknown, unknown>[], reverse = false, pruneByPathLength = false) {
    const sortFunc = getSortFunc(reverse, pruneByPathLength);
    list.sort(sortFunc);
}

// Sort using bubblesort
export function bubbleSort(list: Node<unknown, unknown, unknown>[], reverse = false, pruneByPathLength = false) {
    const sortFunc = getSortFunc(reverse, pruneByPathLength);

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
export function bubbleSortEfficient(
    list: Node<unknown, unknown, unknown>[],
    reverse = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pruneByPathLength = false,
) {
    for (;;) {
        // Mark as not changed for this pass
        let changed = false;
        // Iterate through list
        for (let i = 1; i < list.length; i++) {
            // Get a and b children
            const a = list[i - 1];
            const b = list[i];
            // Check if reached un updated nodes
            if (b.inheritedDepth > a.inheritedDepth) {
                // Stop this iteration
                break;
            }
            // Returns positive if b should switch with a
            if ((!reverse && b.inheritedValue > a.inheritedValue) || (reverse && b.inheritedValue < a.inheritedValue)) {
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
