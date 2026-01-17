import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ ENTERPRISES (ADHÉRANTES) ============
export const adminEntreprises = {
  getAll: () => API.get('/admin/entreprises'),
  getById: (id) => API.get(`/admin/entreprises/${id}`),
  update: (id, data) => API.put(`/admin/entreprises/${id}`, data),
  delete: (id) => API.delete(`/admin/entreprises/${id}`),
  getStats: (id) => API.get(`/admin/entreprises/${id}/stats`),
};

// ============ FORMATIONS ============
export const adminFormations = {
  getAll: () => API.get('/admin/formations'),
  create: (data) => API.post('/admin/formations', data),
  update: (id, data) => API.put(`/admin/formations/${id}`, data),
  delete: (id) => API.delete(`/admin/formations/${id}`),
};

// ============ VISITES ============
export const adminVisites = {
  getAll: () => API.get('/admin/visites'),
  createEntreprise: (data) => API.post('/admin/visites/entreprise', data),
  createSystematique: (data) => API.post('/admin/visites/systematique', data),
  update: (type, id, data) => API.put(`/admin/visites/${type}/${id}`, data),
  delete: (type, id) => API.delete(`/admin/visites/${type}/${id}`),
};

// ============ SENSIBILISATIONS ============
export const adminSensibilisations = {
  getAll: () => API.get('/admin/sensibilisations'),
  create: (data) => API.post('/admin/sensibilisations', data),
  update: (id, data) => API.put(`/admin/sensibilisations/${id}`, data),
  delete: (id) => API.delete(`/admin/sensibilisations/${id}`),
};

// ============ PARTICIPATIONS ============
export const adminParticipations = {
  getAll: () => API.get('/admin/participations'),
  create: (data) => API.post('/admin/participations', data),
  update: (id, data) => API.put(`/admin/participations/${id}`, data),
  delete: (id) => API.delete(`/admin/participations/${id}`),
};

// ============ CANCELLED ACTIVITIES ============
export const adminCancelled = {
  getAll: () => API.get('/admin/cancelled'),
  replanify: (type, id, data) => API.post(`/admin/replan/${type}/${id}`, data),
  cancel: (type, id, data) => API.post(`/admin/cancel/${type}/${id}`, data),
};

export default API;
