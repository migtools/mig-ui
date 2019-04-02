#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
crd_dir=$_dir/../config/crds
prep_dir=$_dir/../config/prep-crs

oc create -f $crd_dir
oc create -f $prep_dir
