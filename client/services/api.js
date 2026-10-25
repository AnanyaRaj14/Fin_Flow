import axios from 'axios';

const getBaseUrl = () => {
  // In the browser, any non-localhost environment (CloudFront, production domain)
  // MUST use relative '/api' to route through CloudFront proxy to EC2 without CORS or mixed-content issues
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

// Dynamic baseURL interceptor: ensures runtime hostname is respected
api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
  return config;
});

// Response interceptor: reject errors cleanly without triggering hard window.location.href reload loops
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  updateProfile: (formData) => api.put('/auth/update-profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
  getCharts: (year) => api.get(`/dashboard/charts?year=${year}`),
  getReport: (params) => api.get('/dashboard/reports', { params }),
};

// Accounts
export const accountsApi = {
  getAll: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
};

// Transactions
export const transactionsApi = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (formData) => api.post('/transactions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/transactions/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Budgets
export const budgetsApi = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// Goals
export const goalsApi = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Bills
export const billsApi = {
  getAll: () => api.get('/bills'),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  togglePaid: (id) => api.post(`/bills/${id}/toggle-paid`),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
