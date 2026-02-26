import axios from 'axios';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:8000/api/`
    : 'http://localhost:8000/api/');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para manejar errores 401 (Token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const requestUrl = originalRequest.url ?? '';
    const isAuthRefresh = requestUrl.includes('auth/refresh');
    const isAuthLogin = requestUrl.includes('auth/login');
    const isAuthLogout = requestUrl.includes('auth/logout');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRefresh &&
      !isAuthLogin &&
      !isAuthLogout
    ) {
      originalRequest._retry = true;
      try {
        await api.post('auth/refresh/');
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth/signin') {
          window.location.href = '/auth/signin';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
