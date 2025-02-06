#!/usr/bin/env bash

# Move to the root directory of the project
cd -- "$(dirname $0)/.."

set -e

# Update GraphQL schema files
script -q /dev/null -c "npm run graphql:codegen-check -- --verbose"