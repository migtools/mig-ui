import axios from 'axios';
import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { JSON_SERVER_URL } from '../../../config';

const axiosInstance = axios.create({
  baseURL: JSON_SERVER_URL,
  responseType: 'json',
});

const request = {
  get: (url: any, params?: any) => axiosInstance.get(url, { params }),
  delete: (url: any, params?: any) => axiosInstance.delete(url, { params }),
  post: (url: any, payload?: any, headers?) =>
    axiosInstance.post(url, payload, headers),
  put: (url: any, payload: any) => axiosInstance.put(url, payload),
};

const authHeaders = {
  'Content-Type': 'application/json',
};
const migrationStorageFetchSuccess = Creators.migrationStorageFetchSuccess;
const addStorageSuccess = Creators.addStorageSuccess;
const addStorageFailure = Creators.addStorageFailure;
const removeStorageSuccess = Creators.removeStorageSuccess;
const removeStorageFailure = Creators.removeStorageFailure;

const addStorageRequest = payload =>
  request.post(JSON_SERVER_URL + 'migrationStorageList', payload, authHeaders);

const addStorage = values => {
  return dispatch => {
    addStorageRequest(values).then(
      response => {
        dispatch(addStorageSuccess(response.data));
      },
      error => {
        dispatch(AlertCreators.alertError('Failed to add Storage'));
      },
    );
  };
};
const removeStorageRequest = id =>
  request.delete(JSON_SERVER_URL + 'migrationStorageList/' + id, authHeaders);

const removeStorage = id => {
  return dispatch => {
    removeStorageRequest(id).then(
      response => {
        dispatch(removeStorageSuccess(id));
        dispatch(fetchStorage());
      },
      error => {
        dispatch(removeStorageFailure(error));
      },
    );
  };
};
const fetchStorageRequest = () =>
  request.get(JSON_SERVER_URL + 'migrationStorageList', authHeaders);

const fetchStorage = () => {
  return dispatch => {
    fetchStorageRequest().then(
      response => {
        dispatch(migrationStorageFetchSuccess(response.data));
      },
      error => {
        dispatch(AlertCreators.alertError('Failed to get storage list'));
      },
    );
  };
};

export default {
  fetchStorage,
  addStorage,
  removeStorage,
};
