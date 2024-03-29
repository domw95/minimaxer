import * as minimax from "../../dist/index.js";

// Class that implements the game mancala
// 6 pits of 4 tokens for each player
// Landing in empty opposite pit wins tiles
// Optional double move for landing in end
export class mancala {
    pits: Array<Array<number>> = [];
    ends: Array<number> = [];
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
        this.ends = [0, 0];
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
                this.ends[this.activePlayer] += 1;
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
            if (op_count) {
                this.pits[this.activePlayer ^ 1][op_ind] = 0;
                this.ends[this.activePlayer] += op_count + 1;
                this.pits[this.activePlayer][pit] = 0;
            }
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
        clone.ends = this.ends.slice();
        clone.activePlayer = this.activePlayer;
        clone.moves = this.moves.slice(0);
        clone.end = this.end;
        clone.enableDoubleMove = this.enableDoubleMove;
        return clone;
    }
}

// This is the only callback required as it assigns both the value and the moves to the child node
// This works well as the value is very easy to calculate, and the moves are generated as part of playMove function
export const createChildCallback: minimax.CreateChildNodeFunc<mancala, number, number> = (parent, move) => {
    // First create a clone of the gamestate
    const new_gamestate = parent.gamestate.clone();
    // Apply the move
    new_gamestate.playMove(move);
    // Get the score as the difference between tile counts in end pits
    const value = new_gamestate.ends[0] - new_gamestate.ends[1];
    // Assign as Leaf if game has finished, otherwise Inner
    const type = new_gamestate.end ? minimax.NodeType.LEAF : minimax.NodeType.INNER;
    // Only have to assign aim for Minimax/Maxn, Negamax will ignore this
    const aim = new_gamestate.activePlayer == 0 ? minimax.NodeAim.MAX : minimax.NodeAim.MIN;
    // Create the child node to return
    const node = new minimax.Node(type, new_gamestate, move, 0, aim, new_gamestate.moves);
    // Assign the value and return
    node.value = value;
    return node;
};
