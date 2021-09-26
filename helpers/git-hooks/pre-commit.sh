#!/usr/bin/env bash

UNFORMATTED_FILES=$(sh helpers/_format_files_result.sh --dry-run)

if [ ! -z "$UNFORMATTED_FILES" ]; then
  echo "Some files are not formatted."
  echo "Please, fix before commit."
  echo "$UNFORMATTED_FILES"

  exit 1
fi
