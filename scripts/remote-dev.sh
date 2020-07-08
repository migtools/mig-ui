#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export DEVMODE=remote
export EXPRESS_PORT=9001
node $_dir/remote-dev.js || exit 1
cd $_dir/..
yarn concurrently --names "EXPRESS,WEBPACK" -c "green.bold.inverse,blue.bold.inverse" \
  "$_dir/run-local-express.sh --auto-reload" \
  "./node_modules/webpack-dev-server/bin/webpack-dev-server.js \
    --hot --color --progress --info=true --config=$_dir/../config/webpack.dev.js"
