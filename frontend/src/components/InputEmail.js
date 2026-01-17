import React, { useState } from 'react';
import { authService } from '../services/api';

function InputEmail({ value, onChange, error, setError }) {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) {
      setIsAvailable(false);
      setError('Format d\'email invalide');
      return;
    }

    setChecking(true);
    try {
      const response = await authService.checkEmail(email);
      if (response.data.available) {
        setIsAvailable(true);
        setError('');
      } else {
        setIsAvailable(false);
        setError('Cet email est déjà utilisé');
      }
    } catch (err) {
      setIsAvailable(null);
      setError('Erreur lors de la vérification');
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (newValue.trim()) {
      // Debounce la vérification
      const timer = setTimeout(() => {
        checkEmailAvailability(newValue);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsAvailable(null);
      setError('');
    }
  };

  return (
    <div className="form-group">
      <label>Email *</label>
      <div className="input-wrapper">
        <input
          type="email"
          name="email"
          value={value}
          onChange={handleChange}
          placeholder="votre.email@example.com"
          className={isAvailable === true ? 'input-success' : isAvailable === false ? 'input-error' : ''}
          disabled={checking}
        />
        {checking && <span className="spinner">⏳</span>}
        {isAvailable === true && <span className="icon-success">✓</span>}
        {isAvailable === false && <span className="icon-error">✗</span>}
      </div>
      {error && <span className="error-text">{error}</span>}
      {isAvailable === true && <span className="success-text">Email disponible</span>}
    </div>
  );
}

export default InputEmail;
