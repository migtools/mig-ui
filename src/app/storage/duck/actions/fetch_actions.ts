interface IMigStorage {
  MigStorage: object;
  Secret: object;
  status?: string;
}

const migStorageFetchRequest = () => ({
  type: FetchTypes.MIG_STORAGE_FETCH_REQUEST,
});

const migStorageFetchSuccess = (migStorageList: IMigStorage[]) => ({
  type: FetchTypes.MIG_STORAGE_FETCH_SUCCESS,
  migStorageList,
});

const migStorageFetchFailure = () => ({
  type: FetchTypes.MIG_STORAGE_FETCH_FAILURE,
});

export const FetchTypes = {
  MIG_STORAGE_FETCH_REQUEST: 'MIG_STORAGE_FETCH_REQUEST',
  MIG_STORAGE_FETCH_SUCCESS: 'MIG_STORAGE_FETCH_SUCCESS',
  MIG_STORAGE_FETCH_FAILURE: 'MIG_STORAGE_FETCH_FAILURE',
};

export const FetchCreators = {
  migStorageFetchRequest,
  migStorageFetchSuccess,
  migStorageFetchFailure,
};
