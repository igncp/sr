#!/usr/bin/env bash

echo "Running tests ..."

cd test
make && \
  cd .. && \
  ./build/test/test_result
