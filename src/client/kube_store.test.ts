import _ from 'lodash';
import KubeStore from './kube_store';
import { MigResource, MigResourceKind } from './resources';
import {
  createClusterRegistryObj,
  createTokenSecret,
  createMigCluster,
  updateClusterRegistryObj,
  updateTokenSecret,
} from '../client/resources/conversions';
import mocked_data from './kube_store/mocked_data/';


const examplePlan = {
  apiVersion: 'migration.openshift.io/v1alpha1',
  kind: 'MigPlan',
  metadata: {
    creationTimestamp: '2019-03-13T20:27:51Z',
    generation: 1,
    labels: {
      'controller-tools.k8s.io': '1.0',
    },
    name: 'my-plan',
    namespace: 'mig',
    resourceVersion: '30094',
    selfLink: '/apis/migrations.openshift.io/v1alpha1/namespaces/mig/migplans/my-plan',
    uid: '796d06c8-45ce-11e9-9286-0e070849dc4e',
  },
  spec: {
    destClusterRef: {
      name: 'my-new-cluster',
    },
    migrationAssetCollectionRef: {
      name: 'my-migrationassetcollection',
    },
    migrationStorageRef: {
      name: 'my-migrationstorage',
    },
    srcClusterRef: {
      name: 'my-old-cluster',
    },
  },
};

const testNs = 'test-ns';
const planName = 'my-plan';
const expectedGvk = 'migration.openshift.io/v1alpha1/migplans';
const clusterName = 'my-cluster';
const clusterUrl = 'http://cluster.myexample.com';
const tokenValue = 'blahblah';

test('Test NamespacedResource setResource', () => {
  const migResource = new MigResource(MigResourceKind.MigPlan, testNs);
  const store = new KubeStore('_host');
  const expected = {
    namespace: {
      [testNs]: {
        [expectedGvk]: {
          [planName]: examplePlan,
        },
      },
    },
    cluster: {},
  };

  store.setResource(migResource, planName, examplePlan);
  expect(_.isEqual(expected, store.db)).toBe(true);
});


function createTestClusterObj(name, namespace, url, token) {
  const clusterReg = createClusterRegistryObj(
    name,
    namespace,
    url
  );
  const tokenSecret = createTokenSecret(
    name,
    'openshift-config',
    token
  );
  const migCluster = createMigCluster(
    name,
    namespace,
    clusterReg,
    tokenSecret
  );
  return migCluster;
}

test('Test NamespacedResource patchResource', () => {
  // Approach:
  //   1. Grab an entity we know is already in kube_store via mocked_data that was loaded.
  //   2. Create a patch command that will flip a boolean value inside of the entry
  //   3. Issue patch command on this object which we know is already in kube_store
  //   4. Get the resource via kube_store
  //   5. Verify that the entry we expected to be flipped was.
  //   6. Verify the other entries in the object are what we expected 
  //      via the copy we obtained directly from mocked_data

  // Grabbing first MigCluster object from mocked data
  //const key = 'apis/migration.openshift.io/v1alpha1/namespaces/mig/migclusters'; 
  //const rawMigClusters = mocked_data['clusters']['_host'][key];
  //const rawMigClusterNames = Object.keys(rawMigClusters);
  // We assume that we will always have at least one entry of MigClusters in mocked data
  
  //const myTestClusterName = rawMigClusterNames[0];
  //const myTestClusterObj = mocked_data['clusters']['_host'][key][myTestClusterName];
  //const myTestNamespace = myTestClusterObj['metadata']['namespace'];
  //const myIsHostCluster = myTestClusterObj['spec']['isHostCluster'];

  const myTestNamespace = 'mig';
  const store = new KubeStore('_host');
  const migResource = new MigResource(MigResourceKind.MigCluster, myTestNamespace);
  const migClusters = store.listResource(migResource);
  expect(_.isEmpty(migClusters)).toBe(false);

  const myTestClusterObj = migClusters[0];
  const myTestClusterName = myTestClusterObj['metadata']['name'];
  const myIsHostCluster = myTestClusterObj['spec']['isHostCluster'];

  const newValueIsHostCluster = !myIsHostCluster;
  // Make a deep copy of what we have to ensure no tampering from shared object state
  const expectedObj = { 
    ...myTestClusterObj, 
    spec: { ...myTestClusterObj['spec'], isHostCluster: newValueIsHostCluster}
  };

  const patch = {
    'spec': {
      'isHostCluster': newValueIsHostCluster
    }
  };

  console.log('expectedObj');
  console.log(expectedObj);


  const patchedObject = store.patchResource(migResource, myTestClusterName, patch);
  const lookedUpObject = store.getResource(migResource, myTestClusterName);

  console.log(patch);
  console.log('lookedUpObject');
  console.log(lookedUpObject);

  expect(patchedObject).toEqual(expectedObj);
  expect(lookedUpObject).toEqual(expectedObj);



  /*
  const migResource = new MigResource(MigResourceKind.MigCluster, testNs);
  const migClusterObj = createMigCluster(clusterName, testNs, clusterUrl, tokenValue);


  store.setResource(migResource, clusterName, migClusterObj);

  console.log(migClusterObj);





  const patch = {'test':'foo'};

  const expected = {

      namespace: testNs,
        _gvk:
          { group: 'migration.openshift.io',
            version: 'v1alpha1',
            kindPlural: 'migclusters' },
          test: 'foo',
    };

  const patchedObject = store.patchResource(migResource, clusterName, patch);
  //localStorage.clear();
  //localStorage.setItem('test', JSON.stringify(patchedObject))
  console.log(patchedObject);
  expect(patchedObject).toEqual(expected);
  */

});
