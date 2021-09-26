#!/usr/bin/env bash

set -e

find \
  . \
  -type f \
  -name "*.[c|h]" \
| \
xargs \
  -I {} \
astyle \
  --style=allman \
  --indent-after-parens \
  --formatted \
  "$@" \
  {}
