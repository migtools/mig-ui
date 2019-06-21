#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$_dir/.."

REGISTRY=${REGISTRY:-"quay.io"}
REPO=${REPO:-"ocpmigrate"}
IMAGENAME=${IMAGENAME:-"mig-ui"}
TAG=${TAG:-"latest"}
FULLTAG="$REGISTRY/$REPO/$IMAGENAME:$TAG"

pushd $rootDir
docker push $FULLTAG
popd
