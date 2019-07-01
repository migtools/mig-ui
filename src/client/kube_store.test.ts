import _ from 'lodash';
import KubeStore from './kube_store';
import { MigResource, MigResourceKind } from './resources';
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
const clusterName = 'my-cluster'

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

test('Test NamespacedResource patchResource', () => {
  const migResource = new MigResource(MigResourceKind.MigCluster, testNs);
  const store = new KubeStore('_host');
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
  localStorage.clear();
  localStorage.setItem('test', JSON.stringify(patchedObject))
  expect(patchedObject).toEqual(expected);
});
