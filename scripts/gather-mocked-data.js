const yaml = require('js-yaml');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

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
const TIME_STAMP = Math.round(+new Date() / 1000);

const MOCKED_DATA_DIR = path.resolve(__dirname, '../src/client/kube_store/mocked_data');
const INDEX_LOCATION = path.resolve(MOCKED_DATA_DIR, 'index.ts');
const JSON_LOCATION = path.resolve(MOCKED_DATA_DIR, `${TIME_STAMP}.json`);

function pruneOlderMocks() {
  const files = fs.readdirSync(MOCKED_DATA_DIR);
  const jsonFiles = files.filter(name => {
    return path.extname(name) === '.json';
  });

  // Parse index and run regex to extract the filename
  const indexData = fs.readFileSync(INDEX_LOCATION, 'utf-8');
  const matches = indexData.match(".*import data from '(.*)?';");
  if (!matches) {
    console.log('Unable to find current mocked json data from "' + INDEX_LOCATION + '"');
    process.exit(1);
  }
  let refJsonFile = matches[1];
  if (refJsonFile.startsWith('./')) {
    refJsonFile = refJsonFile.substring(2);
  }
  console.log('We want to keep the current mocked json data which is "' + refJsonFile + '"');
  const filesToRemove = jsonFiles.filter(name => {
    return name !== refJsonFile;
  });
  filesToRemove.forEach(name => {
    try {
      execSync(`git rm ${MOCKED_DATA_DIR}/${name} &> /dev/null`, { stdio: 'inherit' });
    } catch {
      execSync(`rm ${MOCKED_DATA_DIR}/${name}`, { stdio: 'inherit' });
    }
  });
}

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

function writeData(data) {
  const indexText = `import data from './${TIME_STAMP}.json';\nexport default data;`;
  fs.writeFile(INDEX_LOCATION, indexText, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('JSON saved to ' + INDEX_LOCATION);
    }
  });

  fs.writeFile(JSON_LOCATION, JSON.stringify(data, null, 4), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('JSON saved to ' + JSON_LOCATION);
    }
  });
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
    return promiseChain.then(chainResults => {
      return currentTask.then(currentResult => {
        chainResults[currentResult.url] = currentResult;
        return chainResults;
      });
    });
  }, Promise.resolve({}));
}

function collectAndReformat(data) {
  // Reformatting data into format of
  //  { 'url':  response_data }
  return data.then(results => {
    return Object.keys(results).reduce(function(acc, key) {
      let entry = results[key].data.items.reduce((acc, current) => {
        // Example of 'current'
        //  {apiVersion: 'migration.openshift.io/v1alpha1',
        //  kind: 'MigStorage',
        //  metadata: [Object],
        //  spec: [Object]}
        acc[current.metadata.name] = current;
        return acc;
      }, {});
      acc[key] = entry;
      return acc;
    }, {});
  });
}

function gatherSecretRefs(client, serverAddr, data) {
  let migstorages = data['apis/migration.openshift.io/v1alpha1/namespaces/mig/migstorages'];
  let storageKeys = Object.keys(migstorages);
  let storageSecretRefs = storageKeys.reduce((acc, currentKey) => {
    return acc
      .concat(migstorages[currentKey].spec.backupStorageConfig.credsSecretRef)
      .concat(migstorages[currentKey].spec.volumeSnapshotConfig.credsSecretRef);
  }, []);

  let migclusters = data['apis/migration.openshift.io/v1alpha1/namespaces/mig/migclusters'];
  let clusterKeys = Object.keys(migclusters);
  let clusterSecretRefs = clusterKeys.reduce((acc, currentKey) => {
    return acc.concat(migclusters[currentKey].spec.serviceAccountSecretRef);
  }, []);
  let secretRefs = [].concat(storageSecretRefs).concat(clusterSecretRefs);

  let all = secretRefs.map(s => {
    let key = `api/v1/namespaces/${s.namespace}/secrets`;
    let fullUrl = `${serverAddr}/${key}/${s.name}`;
    return client
      .get(fullUrl)
      .then(response => {
        let data = sanitizeSecretData(response.data);
        return { ...s, key: key, data: data, serverAddr: serverAddr };
      })
      .catch(error => {
        console.log(error);
        process.exit(1);
      });
  });

  return all.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults => {
      return currentTask.then(currentResult => {
        if (!chainResults[currentResult.key]) {
          chainResults[currentResult.key] = {};
        }
        chainResults[currentResult.key][currentResult.name] = currentResult.data;
        return chainResults;
      });
    });
  }, Promise.resolve(data));
}

function sanitizeSecretData(data) {
  // replace secret keys with dummy data
  // to avoid commiting real cluster data
  concernedKeys = ['aws-access-key-id', 'aws-secret-access-key'];
  mockedData = Buffer.from('mocked-data').toString('base64');
  let sanitizedData = {};
  Object.keys(data.data).forEach(key => {
    if (concernedKeys.indexOf(key) != -1) {
      sanitizedData[key] = mockedData;
    }
  });
  return {
    ...data,
    data: {
      ...data.data,
      ...sanitizedData,
    },
  };
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
  collectAndReformat(p).then(reformatted => {
    gatherSecretRefs(axInst, serverAddr, reformatted).then(results => {
      data = {};
      data['TIME_STAMP'] = TIME_STAMP;
      data['clusters'] = {};
      data['clusters']['_host'] = results;
      console.log('Writing....');
      console.log(data);
      writeData(data);
    });
  });
}

var myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case 'prune':
    console.log('Will prune older mocked data');
    pruneOlderMocks();
    process.exit(0);
    break;
  default:
    console.log('Will gather mocked data');
}

main();
