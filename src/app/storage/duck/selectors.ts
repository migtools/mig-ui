import { createSelector } from 'reselect';

const storageSelectorWithStatus = (state) =>
  state.storage.migStorageList.map((storage) => {
    let hasReadyCondition = null;
    let hasCriticalCondition = null;

    if (!storage.MigStorage.status?.conditions) {
      const emptyStatusObject = {
        hasReadyCondition,
        hasCriticalCondition,
      };
      return { ...storage, StorageStatus: emptyStatusObject };
    }
    hasReadyCondition = !!storage.MigStorage.status?.conditions.some((c) => c.type === 'Ready');
    hasCriticalCondition = !!storage.MigStorage.status?.conditions.some(
      (c) => c.type === 'Critical'
    );
    const statusObject = {
      hasReadyCondition,
      hasCriticalCondition,
    };

    return { ...storage, StorageStatus: statusObject };
  });

const planSelector = (state) => state.plan.migPlanList.map((p) => p);

const getAllStorage = createSelector([storageSelectorWithStatus], (storage) => {
  return storage;
});

const getAssociatedPlans = createSelector(
  [storageSelectorWithStatus, planSelector],
  (storageList, plans) => {
    return storageList.reduce((associatedPlans, storage) => {
      const storageName = storage.MigStorage.metadata.name;
      associatedPlans[storageName] = plans.reduce((count, plan) => {
        const hasStorage = !!plan.MigPlan.spec.migStorageRef;

        const isAssociated =
          hasStorage &&
          (plan.MigPlan.spec.migStorageRef.name === storageName ||
            plan.MigPlan.spec.migStorageRef.name === storageName);

        return isAssociated ? count + 1 : count;
      }, 0);
      return associatedPlans;
    }, {});
  }
);

export default {
  getAllStorage,
  getAssociatedPlans,
};
