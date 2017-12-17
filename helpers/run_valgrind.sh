#!/usr/bin/env bash

# Valgrind will report memory still accessible in the heap
# from NCurses calls. To avoid this, download NCurses from:
# `https://ftp.gnu.org/pub/gnu/ncurses/`
# Build with:
# `configure --disable-leaks && make`

make && \
  valgrind \
    --leak-check=full \
    --track-origins=yes \
    --log-file=./valgrind-log \
    `# --show-leak-kinds=all \`# to see reacheable sources\`` \
    build/bin/sr "$@" && \
  "$EDITOR" ./valgrind-log
