import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Ajusta esto si tu backend corre en otro puerto
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (Token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 y no hemos reintentado ya
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            // Intentar refrescar el token
            const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                refresh: refreshToken
            });
            
            if (response.status === 200) {
                localStorage.setItem('access_token', response.data.access);
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access;
                return api(originalRequest);
            }
        }
      } catch (refreshError) {
        // Si falla el refresh, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
