#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export DEVMODE=remote
node $_dir/remote-dev.js && \
  (cd $_dir/.. && ./node_modules/webpack-dev-server/bin/webpack-dev-server.js \
  --hot --color --progress --info=true --config=$_dir/../config/webpack.dev.js)
