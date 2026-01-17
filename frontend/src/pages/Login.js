import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/LoginImproved.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Veuillez entrer votre email et mot de passe');
        setLoading(false);
        return;
      }

      const response = await authServiceV2.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log(`✅ Connexion réussie - Rôle: ${user.role}`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'medecin_chef') {
        navigate('/medecin-chef');
      } else if (user.role === 'adherent' || user.role === 'adherant') {
        navigate('/adherent');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Connexion échouée. Veuillez réessayer.';
      setError(errorMsg);
      console.error('Login error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container-form-only">
        {/* Login Form Only */}
        <div className="login-form-container-full">
          <div className="login-form-wrapper">
            <div className="form-header">
              <h2>Connexion AMIT</h2>
              <p>Accédez à votre compte</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form-new">
              <div className="form-group-new">
                <label htmlFor="email">
                  <span className="label-icon">📧</span> Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  disabled={loading}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group-new">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span> Mot de passe
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-login">
                {loading ? (
                  <>
                    <span className="spinner"></span> Connexion en cours...
                  </>
                ) : (
                  '🚀 Se Connecter'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>Vous n'avez pas de compte?</p>
              <Link to="/register" className="link-register">
                Créer un compte entreprise →
              </Link>
              <p style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <Link to="/forgot-password" className="link-register">
                Réinitialiser le mot de passe →
              </Link>              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
