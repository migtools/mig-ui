#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export DEVMODE=remote
export MIGMETA_FILE="$_dir/../tmp/migmeta.json"
export VIEWS_DIR="$_dir/../public"
export STATIC_DIR="$_dir/../dist"
yarn localbuild && node $_dir/remote-dev.js && \
  (cd $_dir && node ../deploy/main.js)

