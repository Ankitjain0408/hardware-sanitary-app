import axios from "axios";

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Central place to configure axios behavior across the app
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

let isDown = false;

axios.interceptors.response.use(
  (res) => {
    if (isDown) {
      isDown = false;
      window.dispatchEvent(new CustomEvent("api:status", { detail: { up: true } }));
    }
    return res;
  },
  (err) => {
    // Network errors or CORS failures often come through as no response
    if (!err?.response) {
      if (!isDown) {
        isDown = true;
        window.dispatchEvent(new CustomEvent("api:status", { detail: { up: false } }));
      }
    }
    return Promise.reject(err);
  }
);

// Helper function for fetch requests with API base URL
export const apiFetch = (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    credentials: 'include',
    ...options,
  });
};

export default axios;


