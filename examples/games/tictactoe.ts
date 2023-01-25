import * as minimax from "../../dist/index.js";

export const enum CellType {
    EMPTY,
    CIRCLE,
    CROSS,
}

export class tictactoe {
    state: Array<Array<CellType>> = [];
    next_turn: CellType = CellType.EMPTY;
    winner = CellType.EMPTY;
    moves: Array<Array<number>> = [];
    played = 0;
    end = false;

    /** Initialise the game state and generate moves */
    start() {
        this.next_turn = CellType.CIRCLE;
        for (let row = 0; row < 3; row++) {
            this.state.push(Array<CellType>(3).fill(CellType.EMPTY));
        }
        this.generateMoves();
    }

    /** Creates a list of moves as grid indices for current player */
    generateMoves() {
        this.moves = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.state[row][col] == CellType.EMPTY) {
                    this.moves.push([row, col]);
                }
            }
        }
    }

    /** Plays a move, checks for a win or draw, creates list of moves for next player */
    playMove(move: number[]): void {
        this.state[move[0]][move[1]] = this.next_turn;
        this.played += 1;
        this.checkWin(move);
        if (this.next_turn == CellType.CIRCLE) {
            this.next_turn = CellType.CROSS;
        } else {
            this.next_turn = CellType.CIRCLE;
        }
        this.generateMoves();
        if (this.moves.length == 0) {
            this.end = true;
        }
    }

    /** Checks for a win condition after the last move played */
    checkWin(last_move: number[]) {
        // 0,1,2 | 3,4,5 | 6,7,8 | 0,3,6 | 1,4,7 | 2,5,8 | 0,4,7 | 2,4,6 |
        const cell_type = this.state[last_move[0]][last_move[1]];
        // Check row
        if (
            this.state[last_move[0]][(last_move[1] + 1) % 3] == cell_type &&
            this.state[last_move[0]][(last_move[1] + 2) % 3] == cell_type
        ) {
            this.winner = cell_type;
            this.end = true;
            // Check column
        } else if (
            this.state[(last_move[0] + 1) % 3][last_move[1]] == cell_type &&
            this.state[(last_move[0] + 2) % 3][last_move[1]] == cell_type
        ) {
            this.winner = cell_type;
            this.end = true;
            // Check diagonals
        } else if (this.state[0][0] == cell_type && this.state[1][1] == cell_type && this.state[2][2] == cell_type) {
            this.winner = cell_type;
            this.end = true;
        } else if (this.state[0][2] == cell_type && this.state[1][1] == cell_type && this.state[2][0] == cell_type) {
            this.winner = cell_type;
            this.end = true;
        }
    }

    /** Clones the instance for creating game trees */
    clone(): tictactoe {
        const clone = new tictactoe();
        clone.state = this.state.map((x) => {
            return x.slice();
        });
        clone.moves = this.moves.map((x) => {
            return x.slice();
        });
        clone.next_turn = this.next_turn;
        clone.played = this.played;
        return clone;
    }
}

/** Returns a reference to the possible moves for the gamestate */
export const getMovesCallback: minimax.GetMovesFunc<tictactoe, number[]> = (gamestate: tictactoe): Array<number[]> => {
    return gamestate.moves;
};

/** Clones the gamestate, plays the move, creates a new tree node */
export const createChildCallback: minimax.CreateChildNodeFunc<tictactoe, Array<number>, number> = (node, move) => {
    // First create a clone of the gamestate
    const new_gamestate = node.gamestate.clone();
    // Apply the move
    new_gamestate.playMove(move);
    // Return a new node with correct node type
    // let node:Node<tictactoe, Array<number>>;
    if (new_gamestate.end) {
        return new minimax.Node(minimax.NodeType.LEAF, new_gamestate, move, 0);
    } else {
        return new minimax.Node(minimax.NodeType.INNER, new_gamestate, move, 0);
    }
};

/** Evaluates the gamestate, 1 for circle win, 0 for draw, -1 for crosses win */
export const evaluateGamestateCallback: minimax.EvaluateNodeFunc<tictactoe, number[], number> = (node): number => {
    // Get winner from gamestate and return values accordingly
    const winner = node.gamestate.winner;
    switch (winner) {
        case CellType.EMPTY:
            return 0;
        case CellType.CIRCLE:
            // Rank by number of moves played
            return 1;
        case CellType.CROSS:
            return -1;
    }
};
