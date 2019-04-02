#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
oc new-project mig
oc create sa -n mig mig
oc adm policy add-cluster-role-to-user cluster-admin system:serviceaccount:mig:mig
oc sa get-token -n mig mig
