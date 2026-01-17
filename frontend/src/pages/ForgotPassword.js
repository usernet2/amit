import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/Register.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code + password
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'L\'email est requis' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Format d\'email invalide' });
      return;
    }

    setLoading(true);

    try {
      await authServiceV2.forgotPassword(email);
      setStep(2);
      alert('Un code de réinitialisation a été envoyé à votre email.');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Une erreur s\'est produite';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!resetCode.trim()) {
      newErrors.resetCode = 'Le code est requis';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await authServiceV2.resetPassword(email, resetCode, newPassword);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login/v2', {
          state: { message: 'Mot de passe réinitialisé avec succès! Veuillez vous connecter.' }
        });
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la réinitialisation';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h1>🔐 Réinitialiser Mot de Passe</h1>
          <p>Récupérez l'accès à votre compte</p>
        </div>

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            <h3>Mot de Passe Réinitialisé!</h3>
            <p>Redirection vers la connexion...</p>
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            <span className="error-icon">✗</span>
            <p>{errors.submit}</p>
          </div>
        )}

        {step === 1 ? (
          <form className="register-form" onSubmit={handleEmailSubmit}>
            <div className="form-section">
              <h3>📧 Étape 1: Vérification Email</h3>

              <div className="form-group">
                <label htmlFor="email">Adresse Email *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@gmail.com"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !email.trim()}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le Code'}
              </button>
            </div>

            <div className="form-footer">
              <p>Vous vous souvenez de votre mot de passe?</p>
              <Link to="/login/v2" className="login-link">
                Se connecter ici
              </Link>
            </div>
          </form>
        ) : (
          <form className="register-form" onSubmit={handleResetSubmit}>
            <div className="form-section">
              <h3>🔑 Étape 2: Réinitialiser Mot de Passe</h3>

              <div className="form-group">
                <label htmlFor="resetCode">Code de Réinitialisation *</label>
                <input
                  type="text"
                  id="resetCode"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Entrez le code reçu par email"
                  className={errors.resetCode ? 'input-error' : ''}
                />
                {errors.resetCode && <span className="error-text">{errors.resetCode}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nouveau Mot de Passe *</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className={errors.newPassword ? 'input-error' : ''}
                />
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le Mot de Passe *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !resetCode.trim() || !newPassword || !confirmPassword}
              >
                {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le Mot de Passe'}
              </button>

              <button
                type="button"
                className="submit-btn"
                style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                onClick={() => {
                  setStep(1);
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrors({});
                }}
              >
                ← Retour
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
