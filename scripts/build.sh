#!/usr/bin/env bash
set -e

info() { echo "$0: $1"; }
build() { info "Peforming $1 build"; }

# Only build on non-forks
[[ "$TRAVIS_REPO_SLUG" == "eHealthAfrica/sense-ebola-dashboard" ]] || exit 1

# Do not build pull requests
[[ "$TRAVIS_PULL_REQUEST" == "false" ]] || exit 1

if [[ "$TRAVIS_BRANCH" == "master" ]]; then
  build "release"
  grunt build:prod
elif [[ "$TRAVIS_BRANCH" == "develop" ]]; then
  build "snapshot"
  grunt build
else
  info "not building ${TRAVIS_BRANCH} branch"
fi
