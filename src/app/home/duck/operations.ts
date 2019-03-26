import axios from 'axios';

import { JSON_SERVER_URL } from '../../../config';

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
};

export default {};
