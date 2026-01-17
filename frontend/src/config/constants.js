// Configuration des centres disponibles
export const CENTRES = [
  {
    id: 1,
    nom: 'Centre Nord',
    adresse: '123 Rue de Paris',
    contact: '01 23 45 67 89',
    email: 'nord@centre.com'
  },
  {
    id: 2,
    nom: 'Centre Sud',
    adresse: '456 Rue de Lyon',
    contact: '04 56 78 90 12',
    email: 'sud@centre.com'
  }
];

// Rôles disponibles sur la plateforme
export const ROLES = {
  ADMIN: 'admin',
  MEDECIN_CHEF: 'medecin_chef',
  ADHERANT: 'adherant'
};

// Configuration d'authentification
export const AUTH_CONFIG = {
  JWT_EXPIRY: '7d',
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  API_BASE_URL: 'http://localhost:5000/api/v2'
};

// Chemins de redirection par rôle
export const ROLE_PATHS = {
  admin: '/admin',
  medecin_chef: '/medecin-chef',
  adherant: '/adherant'
};
