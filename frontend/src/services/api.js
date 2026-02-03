import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v2';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH SERVICE
export const authServiceV2 = {
  checkAdherent: (raison_sociale, telephone) =>
    api.post('/auth/check-adherent', { raison_sociale, telephone }),
  registerUser: (email, password, adherent_id) =>
    api.post('/auth/register-user', { email, password, adherent_id }),
  sendConfirmationCode: (adherent_id, adherent_email) =>
    api.post('/auth/send-confirmation-code', { adherent_id, adherent_email }),
  registerUserWithConfirmation: (email, password, adherent_id, adherent_email, confirmation_code) =>
    api.post('/auth/register-user-with-confirmation', { email, password, adherent_id, adherent_email, confirmation_code }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (email, resetCode, newPassword) =>
    api.post('/auth/reset-password', { email, resetCode, newPassword }),
  getProfile: () =>
    api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },
};

// ADMIN SERVICE
export const adminServiceV2 = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  getCancelledActivities: () =>
    api.get('/admin/cancelled-activities'),
  replanActivity: (type, id, data) =>
    api.post(`/admin/replan/${type}/${id}`, data),
  
  // Formations CRUD
  getFormations: () =>
    api.get('/admin/formations'),
  createFormation: (data) =>
    api.post('/admin/formations', data),
  updateFormation: (id, data) =>
    api.put(`/admin/formations/${id}`, data),
  deleteFormation: (id) =>
    api.delete(`/admin/formations/${id}`),
  
  // Visites CRUD
  getVisites: () =>
    api.get('/admin/visites'),
  createVisiteEntreprise: (data) =>
    api.post('/admin/visites/entreprise', data),
  createVisiteSystematique: (data) =>
    api.post('/admin/visites/systematique', data),
  updateVisite: (type, id, data) =>
    api.put(`/admin/visites/${type}/${id}`, data),
  deleteVisite: (type, id) =>
    api.delete(`/admin/visites/${type}/${id}`),
  
  // Sensibilisations CRUD
  getSensibilisations: () =>
    api.get('/admin/sensibilisations'),
  createSensibilisation: (data) =>
    api.post('/admin/sensibilisations', data),
  updateSensibilisation: (id, data) =>
    api.put(`/admin/sensibilisations/${id}`, data),
  deleteSensibilisation: (id) =>
    api.delete(`/admin/sensibilisations/${id}`),
  
  // Entreprises CRUD
  getEntreprises: () =>
    api.get('/admin/entreprises'),
  searchEntreprises: (q) =>
    api.get('/admin/entreprises/search', { params: { q } }),
  getEntrepriseById: (id) =>
    api.get(`/admin/entreprises/${id}`),
  updateEntreprise: (id, data) =>
    api.put(`/admin/entreprises/${id}`, data),
  deleteEntreprise: (id) =>
    api.delete(`/admin/entreprises/${id}`),
  
  // Participations CRUD
  getParticipations: () =>
    api.get('/admin/participations'),
  createParticipation: (data) =>
    api.post('/admin/participations', data),
  updateParticipation: (id, data) =>
    api.put(`/admin/participations/${id}`, data),
  deleteParticipation: (id) =>
    api.delete(`/admin/participations/${id}`),
};

// MÉDECIN CHEF SERVICE
export const medecinChefServiceV2 = {
  getDashboard: () =>
    api.get('/medecin-chef/dashboard'),
  getVisites: (month, year) =>
    api.get('/medecin-chef/visites', { params: { month, year } }),
  getFormations: (month, year) =>
    api.get('/medecin-chef/formations', { params: { month, year } }),
  getSensibilisations: (month, year) =>
    api.get('/medecin-chef/sensibilisations', { params: { month, year } }),
};

// ADHÉRANT SERVICE
export const adherantServiceV2 = {
  getDashboard: () =>
    api.get('/adherant/dashboard'),
  getVisites: () =>
    api.get('/adherant/visites'),
  getFormations: () =>
    api.get('/adherant/formations'),
  getSensibilisations: () =>
    api.get('/adherant/sensibilisations'),
  cancelVisite: (id) =>
    api.put(`/adherant/cancel-visite/${id}`),
  cancelFormation: (id) =>
    api.put(`/adherant/cancel-formation/${id}`),
  cancelSensibilisation: (id) =>
    api.put(`/adherant/cancel-sensibilisation/${id}`),
};
