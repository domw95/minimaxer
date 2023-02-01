import * as minimax from "../../dist/index.js";

export class mancala {
    pits: Array<Array<number>> = [];
    stores: Array<number> = [];
    activePlayer = 0;
    moves: Array<number> = [];
    end = false;
    enableDoubleMove = false;

    constructor() {
        // nothing here
    }

    start() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.pits.push(Array(6).fill(4));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.pits.push(Array(6).fill(4));
        this.stores = [0, 0];
        this.generateMoves();
    }

    generateMoves() {
        this.moves = this.pits[this.activePlayer].reduce<Array<number>>((moves, count, ind) => {
            if (count) {
                moves.push(ind);
            }
            return moves;
        }, []);
    }

    playMove(move: number) {
        if (move == -1) {
            // Switch players and generate moves
            this.activePlayer ^= 1;
            this.generateMoves();
            return;
        }

        const count = this.pits[this.activePlayer][move];
        this.pits[this.activePlayer][move] = 0;
        let pit = move;
        for (let c = 0; c < count; c++) {
            pit = (pit + 1) % 14;
            if (pit < 6) {
                this.pits[this.activePlayer][pit] += 1;
            } else if (pit == 6) {
                this.stores[this.activePlayer] += 1;
            } else if (pit == 13) {
                continue;
            } else {
                this.pits[this.activePlayer ^ 1][pit - 7] += 1;
            }
        }

        // Check for steal
        if (pit < 6 && this.pits[this.activePlayer][pit] == 1) {
            const op_ind = 5 - pit;
            const op_count = this.pits[this.activePlayer ^ 1][op_ind];
            this.pits[this.activePlayer][pit] = 0;
            this.pits[this.activePlayer ^ 1][op_ind] = 0;
            this.stores[this.activePlayer] += op_count + 1;
        }

        // Check end conditions
        for (const player of this.pits) {
            let end = true;
            for (const pit of player) {
                if (pit) {
                    end = false;
                    break;
                }
            }
            if (end) {
                this.end = true;
                // Move all stones from
                return;
            }
        }

        // Switch players
        this.activePlayer ^= 1;

        // Check for double move
        if (this.enableDoubleMove && pit == 6) {
            // Check that player can play more moves

            this.moves = [-1];
        } else {
            this.generateMoves();
        }
    }

    clone(): mancala {
        const clone = new mancala();
        clone.pits = this.pits.map((pit) => {
            return pit.slice();
        });
        clone.stores = this.stores.slice();
        clone.activePlayer = this.activePlayer;
        clone.moves = this.moves.slice(0);
        clone.end = this.end;
        clone.enableDoubleMove = this.enableDoubleMove;
        return clone;
    }
}

export const createChildCallback: minimax.CreateChildNodeFunc<mancala, number, number> = (parent, move) => {
    // First create a clone of the gamestate
    const new_gamestate = parent.gamestate.clone();
    // Apply the move
    new_gamestate.playMove(move);
    // Create a new node with correct node type
    const node = new minimax.Node(
        new_gamestate.end ? minimax.NodeType.LEAF : minimax.NodeType.INNER,
        new_gamestate,
        move,
        0,
    );
    // Assign value and moves and return.
    node.value = new_gamestate.stores[0] - new_gamestate.stores[1];
    node.moves = new_gamestate.moves;
    return node;
};
