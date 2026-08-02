import axios from 'axios';

// By default, assuming backend is on port 5000 if not specified
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const setupInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('vennoirr_admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized globally
      if (error.response?.status === 401) {
        localStorage.removeItem('vennoirr_admin_token');
        localStorage.removeItem('vennoirr_admin_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(api);

export const adminAuthService = {
  login: async (email, password) => {
    const response = await api.post('/admin/auth/login', { email, password });
    if (response.data?.success && response.data?.data) {
      localStorage.setItem('vennoirr_admin_token', response.data.data.accessToken);
      localStorage.setItem('vennoirr_admin_user', JSON.stringify(response.data.data.admin));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('vennoirr_admin_token');
    localStorage.removeItem('vennoirr_admin_user');
    window.location.href = '/login';
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('vennoirr_admin_user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('vennoirr_admin_token');
  }
};
