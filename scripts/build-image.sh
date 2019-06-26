#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$_dir/.."
distDir="$rootDir/dist"

REGISTRY=${REGISTRY:-"quay.io"}
REPO=${REPO:-"ocpmigrate"}
IMAGENAME=${IMAGENAME:-"mig-ui"}
TAG=${TAG:-"latest"}
DOCKERFILE=${DOCKERFILE:-"$rootDir/Dockerfile"}
FULLTAG="$REGISTRY/$REPO/$IMAGENAME:$TAG"

pushd $rootDir
cp $rootDir/public/favicon.ico $distDir
docker build -f $DOCKERFILE -t $FULLTAG $rootDir
popd
