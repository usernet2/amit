const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware pour vérifier les rôles spécifiques
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
    }

    next();
  };
};

// Admin only
const verifyAdmin = (req, res, next) => {
  verifyRole(['admin'])(req, res, next);
};

// Médecin Chef only
const verifyMedecinChef = (req, res, next) => {
  verifyRole(['medecin_chef'])(req, res, next);
};

// Adhérant only
const verifyAdherant = (req, res, next) => {
  verifyRole(['adherent', 'adherant'])(req, res, next);
};

// Admin ou Médecin Chef
const verifyAdminOrMedecin = (req, res, next) => {
  verifyRole(['admin', 'medecin_chef'])(req, res, next);
};

module.exports = verifyToken;
module.exports.verifyRole = verifyRole;
module.exports.verifyAdmin = verifyAdmin;
module.exports.verifyMedecinChef = verifyMedecinChef;
module.exports.verifyAdherant = verifyAdherant;
module.exports.verifyAdminOrMedecin = verifyAdminOrMedecin;
