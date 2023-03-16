## Overview

This is the API documentation for the minimaxer Typescript / Javscript library.

The source code is available on [Github](https://github.com/domw95/minimaxer) and I have a detailed write up of the inner-workings on [my blog](https://domwil.co.uk/minimaxer/).

This library provides 3 different solutions for finding the best move in a turn based game:

-   {@link Negamax}
    -   For 2 player games, alternating moves, no random components (deterministic).
-   {@link Minimax}
    -   Same as negamax but allows for a player having multiple turns and probability based selection (e.g dice).
-   {@link Maxn}
    -   Extends minimax to games with more that 2 players.

## Features

Each method varies in its capabilites, but some of the options available include:

-   **Depth based searches** | Search to a specified depth (number of moves ahead).
-   **Iterative Deepening searches** | Search 1 depth further each time until final depth reached.
-   **Time based searches** | Search deeper and deeper until time expires.
-   **Alpha-beta pruning** | Greatly reduces search space.
-   **Presorting nodes** | Combines with alpha-beta pruning for even better results.
-   **Optimised sort** | Makes presorting even faster.
-   **Random selections** | Select moves randomly (weighted or not) to appear less 'robotic'.

and many more!

## Installation

```bash
npm i minimaxmer
```

## Usage

Each method requires specifying some callback functions for your game.
These are used to build the game tree and evaluate the best series of moves by looking
ahead at all the possible outcomes.

Getting the best move from a particular game state requires:

-   Creating a root node
-   Creating a tree
-   Attaching the callbacks
-   Calling the evaluate function to find the best move (and corresponding value).

Details about how to do this for each method can be found here:

-   {@link Negamax}
-   {@link Minimax}
-   {@link Maxn}
