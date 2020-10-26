import { KubeStore, LocalStorageMockedDataKey } from '../kube_store';
import { MigResource, MigResourceKind } from '../resources';
import { isEqual } from 'lodash';

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
const expectedGvk = `apis/migration.openshift.io/v1alpha1/namespaces/${testNs}/migplans`;

test('Test NamespacedResource setResource', () => {
  const migResource = new MigResource(MigResourceKind.MigPlan, testNs);
  const hostCluster = '_host';
  const store = new KubeStore(hostCluster);

  const expected = {
    clusters: {
      [hostCluster]: {
        [expectedGvk]: {
          [planName]: examplePlan,
        },
      },
    },
  };

  localStorage.setItem(
    LocalStorageMockedDataKey,
    JSON.stringify({ clusters: { [hostCluster]: {} } })
  );
  store.setResource(migResource, planName, examplePlan);
  expect(isEqual(JSON.stringify(expected), localStorage.getItem(LocalStorageMockedDataKey))).toBe(
    true
  );
  localStorage.clear();
});
