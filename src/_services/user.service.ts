import axios from "axios";
import { Api } from "../config/settings";

const login = payload => request.post("loginURL", payload, authHeaders);

const axiosInstance = axios.create({
  baseURL: Api.API_URL,
  responseType: "json"
});

const request = {
  get: (url: any, params?: any) => axiosInstance.get(url, { params: params }),
  post: (url: any, payload?: any, headers?) =>
    axiosInstance.post(url, payload, headers),
  put: (url: any, payload: any) => axiosInstance.put(url, payload)
};

const authHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Credentials": "true"
};

function logout() {
  localStorage.removeItem("currentUser");
}

export const userService = {
  login,
  logout
};
