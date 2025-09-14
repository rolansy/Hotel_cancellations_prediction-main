import axios from 'axios';
import { AuthTokens, User, UserCreate, UserUpdate } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hotel-b-cancel-v3.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const formData = new FormData();
    formData.append('username', email);  // OAuth2PasswordRequestForm expects 'username'
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData);
    return response.data;
  },

  register: async (userData: UserCreate): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData: UserUpdate): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
};

export { api };
export default api;
