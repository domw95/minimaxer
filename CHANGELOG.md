<!-- https://keepachangelog.com/en/1.1.0/ -->
<!-- https://github.com/olivierlacan/keep-a-changelog/blob/main/CHANGELOG.md -->
<!-- Tags:
Added
Changed
Deprecated
Removed
Fixed
Security
 -->

# Changelog

## [3.3.0] -

## [3.2.4] - 2023-03-19

### Added

-   Updated the [docs](https://domw95.github.io/minimaxer/index.html) to match the most recent changes.
-   Instructions for how to use the library in the documentation

## [3.2.3] - 2023-02-10

### Fixed

-   Track the depth child is evaluated to avoid selecting wrong child

## [3.2.2] - 2023-02-04

### Fixed

-   Added exports missing from library index.

## [3.2.1] - 2023-02-04

### Changed

-   Docs updated for 3.2.0

## [3.2.0] - 2023-02-04

### Added

-   Premliminary `Maxn` feature

### Changed

-   Faster selection of nodes best child.
-   Negamax `optimal` and standard more efficient.

### Removed

-   **Breaking:** `postsort` negamax option.

## [3.1.0] - 2023-01-25

### Added

-   Bubble and efficient bubble sort for presorting of nodes.

## [3.0.0] - 2023-01-25

### Changed

-   **Breaking:** `moveGenCallback` arguments changed.
-   **Breaking:** `Node` constructor arguments changed.

### Added

-   More rigourous tests.

## [2.1.0] - 2023-01-20

### Added

-   Negamax `pruneByPathLegnth` option: Fast wins and slow losses.
-   Negamax `optimal` option: Dedicated fast negamax function.

## 2.0.0 - 2023-01-19

First public release.

[3.3.0]: https://github.com/domw95/minimaxer/compare/v3.2.4...v3.3.0
[3.2.4]: https://github.com/domw95/minimaxer/compare/v3.2.3...v3.2.4
[3.2.3]: https://github.com/domw95/minimaxer/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/domw95/minimaxer/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/domw95/minimaxer/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/domw95/minimaxer/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/domw95/minimaxer/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/domw95/minimaxer/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/domw95/minimaxer/compare/v2.0.0...v2.1.0
