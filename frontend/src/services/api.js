import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

// Transactions
export const transactionAPI = {
  getAll: () => api.get('/api/transactions'),
  getById: (id) => api.get(`/api/transactions/${id}`),
  create: (data) => api.post('/api/transactions', data),
  update: (id, data) => api.put(`/api/transactions/${id}`, data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
  getByRange: (from, to) => api.get(`/api/transactions/range?from=${from}&to=${to}`),
};

// Budgets
export const budgetAPI = {
  getAll: () => api.get('/api/budgets/all'),
  getByMonth: (month, year) => api.get(`/api/budgets?month=${month}&year=${year}`),
  createOrUpdate: (data) => api.post('/api/budgets', data),
  delete: (id) => api.delete(`/api/budgets/${id}`),
};

// Analytics
export const analyticsAPI = {
  getFull: () => api.get('/api/analytics'),
  getMonthly: (year, month) => api.get(`/api/analytics/monthly?year=${year}&month=${month}`),
  getByRange: (from, to) => api.get(`/api/analytics/range?from=${from}&to=${to}`),
};

export default api;
