import axios from 'axios';

import { Creators } from './actions';
import { JSON_SERVER_URL } from '../../../config';
import { push } from 'connected-react-router';

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
const migrationClusterFetchSuccess = Creators.migrationClusterFetchSuccess;
const addClusterSuccess = Creators.addClusterSuccess;
const addClusterFailure = Creators.addClusterFailure;
const removeClusterSuccess = Creators.removeClusterSuccess;
const removeClusterFailure = Creators.removeClusterFailure;

const addClusterRequest = payload =>
  request.post(JSON_SERVER_URL + 'migrationClusterList', payload, authHeaders);

const addCluster = values => {
  return dispatch => {
    addClusterRequest(values).then(
      response => {
        dispatch(addClusterSuccess(response.data));
        // push('/');
      },
      error => {
        dispatch(addClusterFailure(error));
        // dispatch(alertActions.error(error));
      },
    );
  };
};
const removeClusterRequest = id =>
  request.delete(JSON_SERVER_URL + 'migrationClusterList/' + id, authHeaders);

const removeCluster = id => {
  return dispatch => {
    removeClusterRequest(id).then(
      response => {
        dispatch(removeClusterSuccess(id));
        dispatch(fetchClusters());
        // push('/');
      },
      error => {
        dispatch(removeClusterFailure(error));
        // dispatch(alertActions.error(error));
      },
    );
  };
};
const fetchClustersRequest = () =>
  request.get(JSON_SERVER_URL + 'migrationClusterList', authHeaders);

const fetchClusters = () => {
  return dispatch => {
    fetchClustersRequest().then(
      response => {
        dispatch(migrationClusterFetchSuccess(response.data));
      },
      error => {
        // dispatch((error));
      },
    );
  };
};

export default {
  fetchClusters,
  addCluster,
  removeCluster,
};
