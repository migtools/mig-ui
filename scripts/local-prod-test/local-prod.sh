#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export DEVMODE=remote
node $_dir/../remote-dev.js && \
  (cd $_dir && node server.js)

