#!/usr/bin/env bash

UNFORMATTED_FILES=$(sh helpers/format_files.sh --dry-run)

if [ ! -z "$UNFORMATTED_FILES" ]; then
  echo "Some files are not formatted."
  echo "Please, fix before commit."

  exit 1
fi
