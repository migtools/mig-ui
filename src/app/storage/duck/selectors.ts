import { createSelector } from 'reselect';
import planSelectors from '../../plan/duck/selectors';

const storageSelector = state => state.storage.migStorageList.map(c => c);

const getAllStorage = createSelector(
  [storageSelector],
  storage => {
    return storage;
  }
);

const getAssociatedPlans = createSelector(
  [storageSelector, planSelectors.getAllPlans],
  (storageList, plans) => {
    return storageList.reduce((associatedPlans, storage) => {
      const storageName = storage.MigStorage.metadata.name;
      associatedPlans[storageName] = plans.reduce((count, plan) => {
        const isAssociated = plan.selectedStorage === storageName;
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
