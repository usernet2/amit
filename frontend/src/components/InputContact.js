import React from 'react';

function InputContact({ value, onChange, error, setError }) {
  const validateContact = (phone) => {
    // Accepte formats: 0X-XX-XX-XX-XX, 0XXXXXXXXX, +XXXXXXXXXXXX
    const phoneRegex = /^(?:\+?[0-9]{1,3})?[-.\s]?(?:[0-9]{2,4}[-.\s]?){2,4}[0-9]{2,4}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);

    if (newValue.trim() && !validateContact(newValue)) {
      setError('Format de téléphone invalide');
    } else {
      setError('');
    }
  };

  return (
    <div className="form-group">
      <label>Téléphone (Contact) *</label>
      <div className="input-wrapper">
        <input
          type="tel"
          name="contact"
          value={value}
          onChange={handleChange}
          placeholder="06 XX XX XX XX ou 0X-XXXX-XXXX"
          className={error ? 'input-error' : ''}
        />
        {value && !error && <span className="icon-success">✓</span>}
      </div>
      {error && <span className="error-text">{error}</span>}
      <small className="hint-text">Format: 06XXXXXXXX, 06-XX-XX-XX-XX ou +33...</small>
    </div>
  );
}

export default InputContact;
