import { MigResource, MigResourceKind } from './mig';

test('MigResource namedPath should be correct', () => {
  const ns = 'test-ns';
  const planName = 'eriks-plan';
  const migResource = new MigResource(MigResourceKind.MigPlan, ns);
  expect(migResource.namedPath(planName)).toBe(
    `/apis/migration.openshift.io/v1alpha1/namespaces/${ns}/migplans/${planName}`,
  );
});

test('MigResource listPath should be correct', () => {
  const ns = 'test-ns';
  const migResource = new MigResource(MigResourceKind.MigPlan, ns);
  expect(migResource.listPath()).toBe(
    `/apis/migration.openshift.io/v1alpha1/namespaces/${ns}/migplans`,
  );
});
