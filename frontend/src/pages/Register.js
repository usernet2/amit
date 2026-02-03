import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authServiceV2 } from '../services/api';

export default function Register() {
  const [step, setStep] = useState(1); // Step 1: Find company, Step 2: Confirm adherent email, Step 3: Create account
  const [formData, setFormData] = useState({
    raison_sociale: '',
    telephone: '',
    adherent_email: '',
    confirmation_code: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [foundAdherent, setFoundAdherent] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Step 1: Check if adherent exists
  const handleCheckAdherent = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.raison_sociale.trim()) {
      newErrors.raison_sociale = 'Company name is required';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telephone is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authServiceV2.checkAdherent(
        formData.raison_sociale,
        formData.telephone
      );

      if (response.data.found) {
        setFoundAdherent(response.data);
        setStep(2);
      } else {
        setErrors({ general: 'Company not found in system' });
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Error checking company' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send confirmation code to adherent email
  const handleSendConfirmationCode = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.adherent_email.trim()) {
      newErrors.adherent_email = 'Adherent email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adherent_email)) {
      newErrors.adherent_email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await authServiceV2.sendConfirmationCode(
        foundAdherent.adherent_id,
        formData.adherent_email
      );

      // Store code for display (development only)
      if (response.data.code) {
        setFormData(prev => ({ ...prev, confirmation_code: response.data.code }));
      }

      setStep(3);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Error sending confirmation code' });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register user with confirmation code
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.confirmation_code.trim()) {
      newErrors.confirmation_code = 'Confirmation code is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authServiceV2.registerUserWithConfirmation(
        formData.email,
        formData.password,
        foundAdherent.adherent_id,
        formData.adherent_email,
        formData.confirmation_code
      );

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login/v2', {
          state: { message: 'Account created successfully! Please log in.' }
        });
      }, 2000);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>🏢 Register Company</h1>

        {success && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
            ✓ Account created successfully! Redirecting to login...
          </div>
        )}

        {errors.general && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
            ✗ {errors.general}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckAdherent}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#555' }}>Step 1: Find Your Company</h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Company Name *
              </label>
              <input
                type="text"
                name="raison_sociale"
                value={formData.raison_sociale}
                onChange={handleChange}
                placeholder="Your company name"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.raison_sociale ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.raison_sociale && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.raison_sociale}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Telephone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Your company telephone"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.telephone ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.telephone && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.telephone}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Checking...' : 'Find Company'}
            </button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleSendConfirmationCode}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#555' }}>Step 2: Verify Adherent Email</h2>

            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Company:</strong> {foundAdherent?.raison_sociale}
              </p>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Telephone:</strong> {foundAdherent?.tel}
              </p>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Contact:</strong> {foundAdherent?.contact}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Adherent Email *
              </label>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
                Enter the email address for this company. A confirmation code will be sent here.
              </p>
              <input
                type="email"
                name="adherent_email"
                value={formData.adherent_email}
                onChange={handleChange}
                placeholder="company@example.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.adherent_email ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.adherent_email && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.adherent_email}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {loading ? 'Sending...' : 'Send Confirmation Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setFoundAdherent(null);
                setErrors({});
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterUser}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#555' }}>Step 3: Create Your Account</h2>

            <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Company:</strong> {foundAdherent?.raison_sociale}
              </p>
              <p style={{ margin: '5px 0', color: '#333' }}>
                <strong>Adherent Email:</strong> {formData.adherent_email}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Confirmation Code *
              </label>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
                Enter the code sent to {formData.adherent_email}
              </p>
              <input
                type="text"
                name="confirmation_code"
                value={formData.confirmation_code}
                onChange={handleChange}
                placeholder="e.g., ABC123"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.confirmation_code ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.confirmation_code && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.confirmation_code}</span>}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Your Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@gmail.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.email ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.email && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.password ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.password && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.password}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.confirmPassword ? '2px solid #dc3545' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {errors.confirmPassword && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(2);
                setErrors({});
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <p style={{ margin: '0', color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login/v2" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

