#!/usr/bin/env bash

printf "Running tests with coverage ...\n\n"

cd test

# When collecting coverage, the bin file must be in the same dir
# as the GCC was run, `./test` in this case
make && \
  cp ../build/test/test_result test_main && \
  ./test_main && \
  rm -rf ../coverage && \
  mkdir -p ../coverage && \
  gcovr -r . --html -o ../coverage/index.html --html-details -e "test_.*" && \
  cd .. && \
  make clean
