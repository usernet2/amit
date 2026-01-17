import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',  // Email utilisateur
    emailEntreprise: '',  // Email contact entreprise
    password: '',
    confirmPassword: '',
    raison_sociale: '',
    telephone: '',
    siege: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Centres are handled by backend
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Raison sociale validation
    if (!formData.raison_sociale.trim()) {
      newErrors.raison_sociale = 'Le nom de l\'entreprise est requis';
    } else if (formData.raison_sociale.trim().length < 3) {
      newErrors.raison_sociale = 'Le nom doit contenir au moins 3 caractères';
    }

    // Email entreprise validation
    if (!formData.emailEntreprise.trim()) {
      newErrors.emailEntreprise = 'L\'email de l\'entreprise est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailEntreprise)) {
      newErrors.emailEntreprise = 'Format d\'email invalide';
    }

    // Telephone validation
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[\d\s\-+()]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Send confirmation code to enterprise email
      await authServiceV2.sendConfirmationCode(
        formData.emailEntreprise,
        formData.raison_sociale
      );
      
      setShowCodeInput(true);
      alert('Un code de confirmation a été envoyé à ' + formData.emailEntreprise + '. Veuillez le saisir.');
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'envoi du code';
      setErrors({ submit: errorMsg });
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    if (!confirmationCode.trim()) {
      setErrors({ confirmationCode: 'Veuillez saisir le code de confirmation' });
      return;
    }

    setLoading(true);

    try {
      // Step 2: Register with confirmation code
      await authServiceV2.registerAdherantWithCode(
        formData.email,
        formData.password,
        formData.raison_sociale,
        formData.siege,
        formData.emailEntreprise,
        formData.telephone,
        parseInt(formData.centre_id),
        confirmationCode
      );

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login/v2', {
          state: { message: 'Compte créé avec succès! Veuillez vous connecter.' }
        });
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'L\'inscription a échoué';
      setErrors(prev => ({ ...prev, general: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.email &&
    formData.emailEntreprise &&
    formData.password &&
    formData.confirmPassword &&
    formData.raison_sociale &&
    formData.telephone &&
    formData.centre_id &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8 &&
    Object.keys(errors).length === 0;

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h1>🏢 Créer un Compte Entreprise</h1>
          <p>Rejoignez notre plateforme</p>
        </div>

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            <h3>Compte Créé avec Succès!</h3>
            <p>Redirection vers la connexion...</p>
          </div>
        )}

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">✗</span>
            <p>{errors.general}</p>
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Company Information */}
          <div className="form-section">
            <h3>📋 Informations Entreprise</h3>

            <div className="form-group">
              <label htmlFor="raison_sociale">Nom de l'Entreprise *</label>
              <input
                type="text"
                id="raison_sociale"
                name="raison_sociale"
                value={formData.raison_sociale}
                onChange={handleChange}
                placeholder="Votre Entreprise SARL"
                className={errors.raison_sociale ? 'input-error' : ''}
              />
              {errors.raison_sociale && <span className="error-text">{errors.raison_sociale}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="siege">Adresse du Siège</label>
              <input
                type="text"
                id="siege"
                name="siege"
                value={formData.siege}
                onChange={handleChange}
                placeholder="123 Rue Principale, Ville"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>👤 Informations de Contact</h3>

            <div className="form-group">
              <label htmlFor="email">Email Utilisateur *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@gmail.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emailEntreprise">Email Entreprise (pour la confirmation) *</label>
              <input
                type="email"
                id="emailEntreprise"
                name="emailEntreprise"
                value={formData.emailEntreprise}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                className={errors.emailEntreprise ? 'input-error' : ''}
              />
              {errors.emailEntreprise && <span className="error-text">{errors.emailEntreprise}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Téléphone Entreprise *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+212 6XX XXX XXX"
                className={errors.telephone ? 'input-error' : ''}
              />
              {errors.telephone && <span className="error-text">{errors.telephone}</span>}
            </div>
          </div>

          {/* Security */}
          <div className="form-section">
            <h3>🔐 Sécurité</h3>

            <div className="form-group">
              <label htmlFor="password">Mot de Passe *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le Mot de Passe *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez votre mot de passe"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          {!showCodeInput ? (
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !isFormValid}
            >
              {loading ? 'Envoi du code...' : 'Continuer'}
            </button>
          ) : (
            <div className="form-section">
              <h3>✉️ Confirmation par Email</h3>
              <p style={{ textAlign: 'center', marginBottom: '15px' }}>
                Un code de confirmation a été envoyé à <strong>{formData.emailEntreprise}</strong>
              </p>
              <div className="form-group">
                <label htmlFor="confirmationCode">Code de Confirmation *</label>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Entrez le code reçu"
                  className={errors.confirmationCode ? 'input-error' : ''}
                />
                {errors.confirmationCode && <span className="error-text">{errors.confirmationCode}</span>}
              </div>
              <button
                type="button"
                className="submit-btn"
                onClick={handleCodeSubmit}
                disabled={loading || !confirmationCode.trim()}
              >
                {loading ? 'Vérification...' : 'Vérifier et Créer le Compte'}
              </button>
            </div>
          )}

          <div className="form-footer">
            <p>Vous avez déjà un compte?</p>
            <Link to="/login/v2" className="login-link">
              Se connecter ici
            </Link>
          </div>
        </form>

        <div className="info-box">
          <p>ℹ️ Seuls les employés d'entreprise (adhérents) peuvent s'inscrire ici.</p>
        </div>
      </div>
    </div>
  );
}
