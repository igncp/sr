#!/usr/bin/env bash

set -e

(cd test && make)

./build/test/test_result

echo "Tests run successfully"
