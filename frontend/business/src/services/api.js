import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data)
};

export const businessAPI = {
  createCompany: (data) => api.post('/business/companies', data),
  addEmployee: (data) => api.post('/business/employees', data),
  issueCard: (data) => api.post('/business/cards/corporate', data),
  getExpenses: (params) => api.get('/business/expenses', { params })
};

export default api;
