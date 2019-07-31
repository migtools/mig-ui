
interface IMigStorage {
  MigStorage: object;
  Secret: object;
  status?: string;
}

const updateStorageSearchText = (StorageSearchText: string) => ({
  type: ChangeTypes.UPDATE_STORAGE_SEARCH_TEXT,
  StorageSearchText,
});

const addStorageSuccess = (newStorage: IMigStorage) => ({
  type: ChangeTypes.ADD_STORAGE_SUCCESS,
  newStorage,
});

const addStorageFailure = (error) => ({
  type: ChangeTypes.ADD_STORAGE_FAILURE,
  error,
});

const removeStorageFailure = (storageName: string) => ({
  type: ChangeTypes.REMOVE_STORAGE_FAILURE,
  storageName,
});

const removeStorageSuccess = (name: string) => ({
  type: ChangeTypes.REMOVE_STORAGE_SUCCESS,
  name,
});

const updateStorageSuccess = (updatedStorage: IMigStorage) => ({
  type: ChangeTypes.UPDATE_STORAGE_SUCCESS,
  updatedStorage,
});

const updateStorages = (updatedStorages: IMigStorage[]) => ({
  type: ChangeTypes.UPDATE_STORAGES,
  updatedStorages,
});

export const ChangeTypes = {
  UPDATE_STORAGE_SEARCH_TEXT: 'UPDATE_STORAGE_SEARCH_TEXT',
  ADD_STORAGE_SUCCESS: 'ADD_STORAGE_SUCCESS',
  ADD_STORAGE_FAILURE: 'ADD_STORAGE_FAILURE',
  REMOVE_STORAGE_FAILURE: 'REMOVE_STORAGE_FAILURE',
  REMOVE_STORAGE_SUCCESS: 'REMOVE_STORAGE_SUCCESS',
  UPDATE_STORAGE_SUCCESS: 'UPDATE_STORAGE_SUCCESS',
  UPDATE_STORAGES: 'UPDATE_STORAGES',
};

export const ChangeCreators = {
  updateStorageSearchText,
  addStorageSuccess,
  addStorageFailure,
  removeStorageFailure,
  removeStorageSuccess,
  updateStorageSuccess,
  updateStorages,
};
