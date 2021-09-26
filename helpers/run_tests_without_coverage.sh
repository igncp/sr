#!/usr/bin/env bash

set -e

printf "Running tests without coverage ...\n\n"

(cd test \
  && make)

./build/test/test_result

make clean
