import axios from 'axios';

export default {
  instance() {
    return axios.create({
      baseURL: process.env.VUE_APP_API_ADDR || 'http://localhost:8090',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  setHeader(header, data) {
    axios.defaults.headers.common[header] = data;
  },

  getHeader(header) {
    return axios.defaults.headers.common[header];
  },

  setData(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
  },

  getData(key) {
    return JSON.parse(sessionStorage.getItem(key));
  },

  clearData(key = null) {
    if (key) {
      if (Array.isArray(key)) {
        key.forEach(k => sessionStorage.removeItem(k));
      } else {
        sessionStorage.removeItem(key);
      }
    } else {
      sessionStorage.clear();
    }
  },

  getResultData(apiResult) {
    return apiResult.data.data;
  },

  getErrorMsg(apiError) {
    if (apiError.response) {
      return apiError.response.data.message;
    }
    return apiError.toString();
  },
};
