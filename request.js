const axios = require('axios');
const FormData = require('form-data')
const fs = require('fs')


const axiosInstance = axios.create({
  baseURL: 'https://smms.app/api/v2',
  headers: {
    'Content-Type': 'multipart/form-data;charset=UTF-8',
  },
});

const formDataInterceptors = (config) => {
  if (config.data) {
    const formData = new FormData();
    Object.keys(config.data).forEach((key) => {
      if (!config.data) return;
      const value = config.data[key];
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item);
        });
        return;
      }
      formData.append(key, value);
    });
    config.data = formData;
  }
};

// 请求前置拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const {token, ...rest} = config.data
    if (token) {
      config.headers.Authorization = token;
    }
    config.data = rest
    if (config.headers['Content-Type'].includes('multipart/form-data')) {
      formDataInterceptors(config);
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const { success, message } = response.data || {}
    if (!success) {
      return Promise.reject(new Error(message));
    }
    return response.data.data;
  },
  (error) => {
    if (error.response) {
      const { config, status, statusText, data } = error.response;
      const { data: _data } = config;
      return Promise.reject({
        code: data?.code || status,
        msg: data ? data.message : statusText,
      });
    }

    return Promise.reject(new Error(error));
  }
);

module.exports = {
  request: axiosInstance,

  get: (path, data = {}, config = {}) => {
    return axiosInstance.get(path, {
      params: data,
      ...config,
    });
  },

  post: (path, data = {}, config = {}) => {
    return axiosInstance.post(path, data, config);
  },

  put: (path, data = {}, config = {}) =>
    axiosInstance.put(path, data, config),

  delete: (path, data = {}, config = {}) =>
    axiosInstance.delete(path, {
      params: data,
      ...config,
    }),
};
