import { createSelector } from 'reselect';

const storageSelector = (state) =>
    state.storage.migStorageList.map(c => c);

const searchTermSelector = state => state.storage.searchTerm;

const getAllStorage = createSelector(
    [storageSelector],
    (storage) => {
        return storage;
    },
);

const getVisibleStorage = createSelector(
    [storageSelector, searchTermSelector],
    (storage, searchTerm) => {
        return storage.filter(storageItem =>
            storageItem.MigStorage.metadata.name.match(new RegExp(searchTerm, 'i')));
    },
);
export default {
    getAllStorage,
    getVisibleStorage,
};
