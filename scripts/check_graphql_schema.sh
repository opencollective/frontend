#!/usr/bin/env bash

set -e
set -x

# Move to the root directory of the project
cd -- "$(dirname $0)/.."

# Function to run commands and capture output
run_and_log() {
  "$@" 2>&1 | tee /dev/stderr
  return ${PIPESTATUS[0]}
}

# Run GraphQL schema update commands and capture the exit status
EXIT_STATUS=0

run_and_log npm run graphql:updateV1 || EXIT_STATUS=$?
run_and_log npm run graphql:updateV2 || EXIT_STATUS=$?
run_and_log npm run graphql:codegen || EXIT_STATUS=$?

# Check if any command failed
if [ $EXIT_STATUS -ne 0 ]; then
  echo "Error: One or more commands in graphql:update failed."
  exit $EXIT_STATUS
fi

# Check if GraphQL schema files changed
CHANGED=$(git status --porcelain | grep 'schema')
if [ -n "${CHANGED}" ] ; then
  echo "GraphQL schema files are not up to date. Please run 'npm run graphql:update'"
  echo "-------- FILES --------"
  git status
  echo "-------- DIFF --------"
  git --no-pager diff
  exit 1
else
  echo "GraphQL schema is up to date."
fi