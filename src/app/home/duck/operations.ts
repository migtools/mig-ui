import axios from 'axios';

import { Creators } from './actions';
import { JWT_API_URL, SOCKET_API_URL, JSON_SERVER_URL } from '../../../config';
import { push } from 'connected-react-router';

const axiosInstance = axios.create({
  baseURL: JSON_SERVER_URL,
  responseType: 'json',
});

const request = {
  get: (url: any, params?: any) => axiosInstance.get(url, { params }),
  post: (url: any, payload?: any, headers?) =>
    axiosInstance.post(url, payload, headers),
  put: (url: any, payload: any) => axiosInstance.put(url, payload),
};

const authHeaders = {
  'Content-Type': 'application/json',
  // 'Access-Control-Allow-Credentials': 'true'
};

export default {};
