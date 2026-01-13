/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
};

// ==================== USER API ====================

export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/password', data),
};

// ==================== EXPENSE API ====================

export const expenseAPI = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  
  getRecent: () => api.get('/expenses/recent'),
  
  getById: (id: string) => api.get(`/expenses/${id}`),
  
  create: (data: any) => api.post('/expenses', data),
  
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// ==================== CATEGORY API ====================

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  
  getById: (id: string) => api.get(`/categories/${id}`),
  
  create: (data: any) => api.post('/categories', data),
  
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ==================== SUBSCRIPTION API ====================

export const subscriptionAPI = {
  getAll: (params?: any) => api.get('/subscriptions', { params }),
  
  getById: (id: string) => api.get(`/subscriptions/${id}`),
  
  create: (data: any) => api.post('/subscriptions', data),
  
  update: (id: string, data: any) => api.put(`/subscriptions/${id}`, data),
  
  delete: (id: string) => api.delete(`/subscriptions/${id}`),
};

// ==================== ANALYTICS API ====================

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  
  getMonthly: (year?: number) => api.get('/analytics/monthly', { params: { year } }),
};

export default api;
