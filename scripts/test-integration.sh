#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

################################################################################
# NOTE 03/13/2020: This script is disabled but remains in the repo for archival
# purposes. When bandwidth allows, integration tests will be revamped.
echo "ERROR: This script has been deprecated."
exit 1
################################################################################

projectRoot="$_dir/.."
exDevConfigFile="$projectRoot/config/config.dev.json.example"
devConfigFile="$projectRoot/config/config.dev.json"

if [[ ! -f "$devConfigFile" ]]; then
  cp "$exDevConfigFile" "$devConfigFile"
fi
# TODO: This server dest+port should be parameterized somehow
$projectRoot/node_modules/.bin/start-server-and-test start http://localhost:9000 "$projectRoot/node_modules/.bin/cypress run"
