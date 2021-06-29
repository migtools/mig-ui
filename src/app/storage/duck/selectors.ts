import { createSelector } from 'reselect';
import { DefaultRootState } from '../../../configureStore';
import { IStorage } from './types';
interface IEmptyStorageStatusObject {
  hasReadyCondition: boolean;
  hasCriticalCondition: boolean;
}

const storageSelectorWithStatus = (state: DefaultRootState) =>
  state.storage.migStorageList.map((storage) => {
    let hasReadyCondition = null;
    let hasCriticalCondition = null;
    if (!storage.MigStorage.status?.conditions) {
      const emptyStatusObject: IEmptyStorageStatusObject = {
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

const planSelector = (state: DefaultRootState) => state.plan.migPlanList.map((p) => p);

const getAllStorage = createSelector([storageSelectorWithStatus], (storage) => {
  return storage;
});

const getAssociatedPlans = createSelector(
  [storageSelectorWithStatus, planSelector],
  (storageList, plans) => {
    return storageList.reduce((associatedPlans: any, storage) => {
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
