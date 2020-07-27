#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export DEVMODE=remote
yarn build && node $_dir/remote-dev.js && $_dir/run-local-express.sh

