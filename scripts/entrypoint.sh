#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export MIGMETA_FILE=/etc/mig-ui/migmeta.json
export VIEWS_DIR=/srv/staticroot
export STATIC_DIR=/srv/staticroot
echo 'Found contents of migmeta file:'
cat /etc/mig-ui/migmeta.json
node /srv/main.js
