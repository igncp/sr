# TODO

## Issues

- In some cases (~ 1/20) the selected text does not match the replacement
- Compiler warnings during build

## Refactors and Docs

- List existing features: design docs
- Create user guide (manpage)

## Features

- Add option to replace matches directly, without list

## Infrastructure

- Setup Travis to: build, run tests and valgrind
- Setup Docker image to:
    - build
    - test: unit
    - test: valgrind
    - check format
    - commit
- Docker image to expect files to be manually downloaded and available
