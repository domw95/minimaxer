# Minimax Library for Typescript and Javascript

This library features the negamax, minimax and maxn (experimental) algorithms for find the best moves in turn based games. It can be used to build game-playing 'A.I'.

It features a number of tuning options:

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

See the docs at https://domw95.github.io/minimaxer/index.html.

## How it works

See the series of blog posts at https://domwil.co.uk/minimaxer/.

## Examples

See the [examples](examples) directory for some simple implementations.

See my [Azul project](https://github.com/domw95/azul-tiles/tree/master/src/ai) for a more advanced use case.
