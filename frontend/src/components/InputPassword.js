import React, { useState } from 'react';

function InputPassword({ value, onChange, error, setError, showStrength = true }) {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    return strength;
  };

  const getStrengthLabel = (strength) => {
    if (strength <= 1) return { label: 'Très faible', color: '#e74c3c' };
    if (strength <= 2) return { label: 'Faible', color: '#e67e22' };
    if (strength <= 3) return { label: 'Moyen', color: '#f39c12' };
    if (strength <= 4) return { label: 'Bon', color: '#27ae60' };
    return { label: 'Très bon', color: '#16a085' };
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (newValue.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
    } else {
      setError('');
    }
  };

  const strength = calculateStrength(value);
  const strengthInfo = getStrengthLabel(strength);

  return (
    <div className="form-group">
      <label>Mot de passe *</label>
      <div className="input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={value}
          onChange={handleChange}
          placeholder="Minimum 8 caractères"
          className={error ? 'input-error' : ''}
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex="-1"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      
      {error && <span className="error-text">{error}</span>}
      
      {showStrength && value && (
        <div className="password-strength">
          <div className="strength-bar">
            <div
              className="strength-fill"
              style={{
                width: `${(strength / 6) * 100}%`,
                backgroundColor: strengthInfo.color,
              }}
            />
          </div>
          <span className="strength-label" style={{ color: strengthInfo.color }}>
            Force: {strengthInfo.label}
          </span>
        </div>
      )}

      <div className="password-hints">
        <small>✓ Au moins 8 caractères</small>
        <small>✓ Mélange de majuscules et minuscules</small>
        <small>✓ Incluez des chiffres et caractères spéciaux</small>
      </div>
    </div>
  );
}

export default InputPassword;
