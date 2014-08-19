#!/usr/bin/env bash
set -e

[[ "$TRAVIS" ]] && exit
./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update
