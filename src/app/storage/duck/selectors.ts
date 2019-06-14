import { createSelector } from 'reselect';

const storageSelector = state => state.storage.migStorageList.map(c => c);

const planSelector = state => state.plan.migPlanList.map(p => p);

const getAllStorage = createSelector(
  [storageSelector],
  storage => {
    return storage;
  }
);

const getAssociatedPlans = createSelector(
  [storageSelector, planSelector],
  (storageList, plans) => {
    return storageList.reduce((associatedPlans, storage) => {
      const storageName = storage.MigStorage.metadata.name;
      associatedPlans[storageName] = plans.reduce((count, plan) => {
        const isAssociated =
          plan.MigPlan.spec.migStorageRef.name === storageName ||
          plan.MigPlan.spec.migStorageRef.name === storageName;

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
