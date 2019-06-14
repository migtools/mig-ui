#!/bin/bash

DATA_DIR="./data"
HOST="jwm05162019a.migration.redhat.com"
MIG_NAMESPACE="mig"

MIG_GROUPS=("clusters.clusterregistry.k8s.io" \
  "migclusters.migration.openshift.io" \
  "migmigrations.migration.openshift.io" \
  "migplans.migration.openshift.io" \
  "migstorages.migration.openshift.io" )

TIMESTAMP=`date "+%s"`

function ensureDirsExist {
  mkdir -p "$(dirname "$1")"
}

function fetchResource {
  resourceName=$1
  storePath=$2
  namespace=$3

  if [ "${resourceName}" == "" ]; then
    echo "Empty value for resourceName"
    exit
  fi
  if [ "${storePath}" == "" ]; then
    echo "Empty value for storePath"
    exit
  fi
  if [ "${namespace}" == "" ]; then
    echo "Empty value for namespace"
    exit
  fi

  mkdir -p "$(dirname "$storePath")"
  echo "Fetching:  ${resourceName} from namespace '${namespace}'"
  `oc get ${resourceName} -o json -n ${namespace} &> ${storePath}.json`
  if [ "$?" != "0" ]; then
    echo "Error getting json for '${resourceName}' from ${namespace}"
    exit
  fi
}

for group in "${MIG_GROUPS[@]}"
do
   :
   names=`oc get ${group} -o name -n ${MIG_NAMESPACE}`
   if [ "$?" != "0" ]; then
      echo "Error getting names from '${group}'"
      exit
   fi

   for name in $names
   do
    :
    fullPath="$DATA_DIR/$HOST/${MIG_NAMESPACE}/${name}"
    fetchResource $name $fullPath ${MIG_NAMESPACE}
   done
done

## Need Secret Refs from MigCluster
echo "Process secrets from migcluster.migration.openshift.io"
names=`oc get migcluster.migration.openshift.io -o name -n ${MIG_NAMESPACE}`
if [ "$?" != "0" ]; then
      echo "Error getting names from '${group}'"
      exit
fi
for name in $names
do
  :
  secretName=`oc get ${name} -o jsonpath='{.spec.serviceAccountSecretRef.name}' -n ${MIG_NAMESPACE}`
  secretNamespace=`oc get ${name} -o jsonpath='{.spec.serviceAccountSecretRef.namespace}' -n ${MIG_NAMESPACE}`
  fullPath="$DATA_DIR/$HOST/${secretNamespace}/secret/${secretName}"
  fetchResource "secret/$secretName" $fullPath $secretNamespace
done


## Need Secret Refs from MigStorage
echo "Process secrets from migstorage.migration.openshift.io"
names=`oc get migstorage.migration.openshift.io -o name -n ${MIG_NAMESPACE}`
if [ "$?" != "0" ]; then
      echo "Error getting names from '${group}'"
      exit
fi
for name in $names
do
  :
  echo "Processing '${name}'"
  secretName=`oc get ${name} -o jsonpath='{.spec.backupStorageConfig.credsSecretRef.name}' -n ${MIG_NAMESPACE}`
  secretNamespace=`oc get ${name} -o jsonpath='{.spec.backupStorageConfig.credsSecretRef.namespace}' -n ${MIG_NAMESPACE}`
  fullPath="$DATA_DIR/$HOST/${secretNamespace}/secret/${secretName}"
  fetchResource "secret/$secretName" $fullPath $secretNamespace

  secretName=`oc get ${name} -o jsonpath='{.spec.volumeSnapshotConfig.credsSecretRef.name}' -n ${MIG_NAMESPACE}`
  secretNamespace=`oc get ${name} -o jsonpath='{.spec.volumeSnapshotConfig.credsSecretRef.namespace}' -n ${MIG_NAMESPACE}`
  fullPath="$DATA_DIR/$HOST/${secretNamespace}/secret/${secretName}"
  fetchResource "secret/$secretName" $fullPath $secretNamespace
done


# Remove any real data from 'aws-access-key-id' or 'aws-secret-access-key'
# Replacing with a string of base64 encoded value of 'mocked-values'
#    $ echo "mocked-values" | base64
#    bW9ja2VkLXZhbHVlcwo=
# macos wants sed to be invoked with -i '' -e
find ${DATA_DIR} -type f | xargs sed -i '' -e 's/"aws-access-key-id":.*/"aws-access-key-id": "bW9ja2VkLXZhbHVlcwo=",/g'
find ${DATA_DIR} -type f | xargs sed -i '' -e 's/"aws-secret-access-key":.*/"aws-secret-access-key": "bW9ja2VkLXZhbHVlcwo="/g'

echo "${TIMESTAMP}" > ${DATA_DIR}/TIMESTAMP