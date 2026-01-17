import React from 'react';

function InputNomAdherant({ value, onChange, error, setError }) {
  const validateNom = (nom) => {
    // Minimum 3 caractères, lettres et espaces/tirets/apostrophes
    const nomRegex = /^[a-zA-ZÀ-ÿ\s'-]{3,}$/;
    return nomRegex.test(nom);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (newValue.trim()) {
      if (!validateNom(newValue)) {
        if (newValue.trim().length < 3) {
          setError('Le nom doit contenir au moins 3 caractères');
        } else {
          setError('Le nom ne doit contenir que des lettres, espaces et tirets');
        }
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  };

  return (
    <div className="form-group">
      <label>Nom de l'adhérant *</label>
      <div className="input-wrapper">
        <input
          type="text"
          name="nom"
          value={value}
          onChange={handleChange}
          placeholder="Ex: Jean Dupont"
          className={error ? 'input-error' : ''}
        />
        {value && !error && <span className="icon-success">✓</span>}
      </div>
      {error && <span className="error-text">{error}</span>}
      <small className="hint-text">Minimum 3 caractères</small>
    </div>
  );
}

export default InputNomAdherant;
