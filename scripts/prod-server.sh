#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir=$_dir/..
export MIGMETA_FILE="$rootDir/config/migmeta.yaml"
export VIEWS_DIR="$rootDir/public"
export STATIC_DIR="$rootDir/dist"
node $rootDir/deploy/main.js
