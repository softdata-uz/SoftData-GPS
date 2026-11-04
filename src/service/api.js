import axios from "axios";
import {ip} from "../ip";

const api = axios.create({
  // baseURL: "http://195.158.1.237:37771/",
  baseURL: ip,
  // baseURL: "http://192.168.10.185:37771/",
    // airport
  // baseURL: "http://10.200.10.49:37771/",
});

api.interceptors.request.use(
  (config) => {
    const updatedConfig = {
      ...config,
      headers: {
        ...config.headers,
        "x-access-token" : localStorage.getItem('gps-x-access-token')
      },
    };
    return updatedConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // network errors / cancelled requests have no `response`; callers handle 401 themselves
    return Promise.reject(error);
  }
);

export default api;
