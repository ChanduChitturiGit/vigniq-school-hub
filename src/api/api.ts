// src/api/api.ts
import axios from 'axios';
import { environment } from '@/environment';

const baseurl = environment.baseurl;

const api = axios.create({
  baseURL: baseurl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 and refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && !window.location.href.includes('/login')) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token');
        const res = await axios.post(baseurl+'/auth/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        sessionStorage.setItem('access_token', newAccessToken);

        // Update token in the failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        if(!window.location.href.includes('/login')){
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
