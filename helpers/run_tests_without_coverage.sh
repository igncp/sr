#!/usr/bin/env bash

printf "Running tests without coverage ...\n\n"

cd test
make && \
  cd .. && \
  ./build/test/test_result && \
  make clean
