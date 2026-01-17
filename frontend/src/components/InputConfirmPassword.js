import React, { useState } from 'react';

function InputConfirmPassword({ value, onChange, error, setError, passwordValue }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (newValue !== passwordValue) {
      setError('Les mots de passe ne correspondent pas');
    } else {
      setError('');
    }
  };

  return (
    <div className="form-group">
      <label>Confirmer le mot de passe *</label>
      <div className="input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={value}
          onChange={handleChange}
          placeholder="Tapez à nouveau votre mot de passe"
          className={error ? 'input-error' : value && !error ? 'input-success' : ''}
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
      {value && !error && <span className="success-text">Les mots de passe correspondent</span>}
    </div>
  );
}

export default InputConfirmPassword;
