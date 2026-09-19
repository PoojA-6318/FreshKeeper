import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getAPIError = (err) => {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((error) => error.msg).join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return err.response?.data?.message || 'Something went wrong.';
};

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fk_token');
      localStorage.removeItem('fk_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ── Auth ── */
export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  //logout: () => api.post('/auth/logout'),
  me: () => api.get('/users/me'),
};

/* ── Households ── */
export const householdsAPI = {
  list: () => api.get('/households'),
  get: (id) => api.get(`/households/${id}`),
  create: (data) => api.post('/households', data),
  addMember: (id, data) => api.post(`/households/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/households/${id}/members/${memberId}`),
};

/* ── Refrigerators ── */
export const refrigeratorsAPI = {
  list: () => api.get('/refrigerators'),
  get: (id) => api.get(`/refrigerators/${id}`),
  create: (data) => api.post('/refrigerators', data),
  update: (id, data) => api.put(`/refrigerators/${id}`, data),
  delete: (id) => api.delete(`/refrigerators/${id}`),
};

/* ── Inventory ── */
export const inventoryAPI = {
  list: (params) => api.get('/inventory', { params }),
  get: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  consume: (id, data) => api.post(`/inventory/${id}/consume`, data),
  discard: (id, data) => api.post(`/inventory/${id}/discard`, data),
};

/* ── Item Types ── */
export const itemTypesAPI = {
  list: () => api.get('/item-types'),
};

/* ── Notifications ── */
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

/* ── Analytics ── */
export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  monthly: () => api.get('/analytics/monthly'),
};

/* ── Shopping List ── */
export const shoppingAPI = {
  list: () => api.get('/shopping-list'),
  create: (data) => api.post('/shopping-list', data),
  update: (id, data) => api.put(`/shopping-list/${id}`, data),
  delete: (id) => api.delete(`/shopping-list/${id}`),
  markPurchased: (id) => api.patch(`/shopping-list/${id}/purchased`),
};

export default api;
