const yaml = require('js-yaml');
const fs = require('fs');
const axios = require('axios');
const https = require('https');

//
//  We need to:
//  1.  Determine which k8s cluster to talk to, so grab info a kubeconfig
//  2.  Get all of the resource info associated to a group of apigroups
//  3.  Fetch the 'secretRefs' in some of the resources
//  4.  Write the fetched data to a .json file so KubeStore is able to process it
//

const MIG_GROUPS = [
  { group: 'clusterregistry.k8s.io', version: 'v1alpha1', kind: 'clusters' },
  { group: 'migration.openshift.io', version: 'v1alpha1', kind: 'migclusters' },
  { group: 'migration.openshift.io', version: 'v1alpha1', kind: 'migmigrations' },
  { group: 'migration.openshift.io', version: 'v1alpha1', kind: 'migplans' },
  { group: 'migration.openshift.io', version: 'v1alpha1', kind: 'migstorages' },
];
const MIG_NAMESPACE = 'mig';

function getKubeServerInfo() {
  const kubeconfig = process.env.KUBECONFIG ? process.env.KUBECONFIG : '~/.kube/config';
  console.log('Using', kubeconfig);
  let serverAddr, cacert, clientcert, clientkey;
  try {
    const config = yaml.safeLoad(fs.readFileSync(kubeconfig, 'utf8'));
    const currentContext = config.contexts.find(o => o.name === config['current-context']);
    const currentClusterName = currentContext.context.cluster;
    const currentCluster = config.clusters.find(o => o.name === currentClusterName);
    serverAddr = currentCluster.cluster.server;
    cacert = Buffer.from(currentCluster.cluster['certificate-authority-data'], 'base64');
    const currentUser = config.users.find(o => o.name === currentContext.context.user);
    clientcert = Buffer.from(currentUser.user['client-certificate-data'], 'base64');
    clientkey = Buffer.from(currentUser.user['client-key-data'], 'base64');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  return { serverAddr, clientcert, clientkey, cacert };
}

function gatherMockedData(client, serverAddr) {
  const namespace = MIG_NAMESPACE;
  const all = MIG_GROUPS.map(v => {
    let url = `apis/${v.group}/${v.version}/namespaces/${namespace}/${v.kind}`;
    let fullUrl = `${serverAddr}/${url}`;
    return client
      .get(fullUrl)
      .then(response => {
        return { ...v, data: response.data, url: url, serverAddr: serverAddr };
      })
      .catch(error => {
        console.log(error);
        process.exit(1);
      });
  });
  //  Reducing to a single promise that has collected all of the results.
  //  Transform from array to a dict that matches the layout of how we want to store the data
  return all.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult => [...chainResults, currentResult])
    );
  }, Promise.resolve([]));
}

function gatherSecretRefs(axInst, serverAddr, data) {
  // At this point we have the data from fetching each apigroup in a single promise.
  // As that single promise resolves we will have a dict of all data
  // We need to parse the data to find the secretRefs to fetch.
  return data.then(results => {
    console.log(results);
    console.log('Doing reduce');
    return results.reduce((acc, current) => {
      console.log('Acc is ');
      console.log(acc);
      console.log('current is ');
      console.log(current);
      return acc ? [...acc, current] : [current];
    }, []);
  });
}

function main() {
  const { serverAddr, clientcert, clientkey, cacert } = getKubeServerInfo();
  console.log('Connecting to ', serverAddr);

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: clientcert,
    key: clientkey,
    ca: cacert,
  });
  const axInst = axios.create({ httpsAgent });
  let p = gatherMockedData(axInst, serverAddr);
  gatherSecretRefs(axInst, serverAddr, p).then(results => {
    console.log(results);
  });
}

main();
