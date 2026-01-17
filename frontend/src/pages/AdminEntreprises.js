import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminEntreprises } from '../services/adminApi';
import { authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminEntreprises.css';

export default function AdminEntreprises() {
  const navigate = useNavigate();
  const [entreprises, setEntreprises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    raison_sociale: '',
    siege: '',
    contact: '',
    email: '',
    numero_identification: '',
  });

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      const response = await adminEntreprises.getAll();
      setEntreprises(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.raison_sociale.trim() || !formData.contact.trim() || !formData.email.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      if (editingId) {
        await adminEntreprises.update(editingId, formData);
        alert('Entreprise mise à jour avec succès');
      } else {
        // Can't create directly from admin, need proper user creation
        alert('Créez un compte via le formulaire d\'inscription');
        return;
      }
      setFormData({
        raison_sociale: '',
        siege: '',
        contact: '',
        email: '',
        numero_identification: '',
      });
      setEditingId(null);
      setShowModal(false);
      fetchEntreprises();
    } catch (error) {
      console.error('Error saving entreprise:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (entreprise) => {
    setFormData({
      raison_sociale: entreprise.raison_sociale,
      siege: entreprise.siege || '',
      contact: entreprise.contact,
      email: entreprise.email,
      numero_identification: entreprise.numero_identification || '',
    });
    setEditingId(entreprise.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      try {
        await adminEntreprises.delete(id);
        alert('Entreprise supprimée');
        fetchEntreprises();
      } catch (error) {
        console.error('Error deleting entreprise:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      raison_sociale: '',
      siege: '',
      contact: '',
      email: '',
      numero_identification: '',
    });
  };

  const handleLogout = () => {
    authServiceV2.logout();
    navigate('/login');
  };

  if (loading) return <div className="admin-container"><div className="dashboard-content"><p>Chargement...</p></div></div>;

  return (
    <div className="admin-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate('/admin')} 
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              ← Retour
            </button>
            <h1 style={{ margin: 0 }}>🏢 Gestion des Entreprises Adhérantes</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
          <p style={{ margin: '0', color: '#666' }}>
            Pour ajouter une nouvelle entreprise, dirigez-la vers le formulaire d'inscription.
          </p>
        </div>

        <div className="entreprises-table">
        {entreprises.length === 0 ? (
          <p className="no-data">Aucune entreprise trouvée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Raison Sociale</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entreprises.map((entreprise) => (
                <tr key={entreprise.id}>
                  <td className="bold">{entreprise.raison_sociale}</td>
                  <td>{entreprise.contact}</td>
                  <td>{entreprise.email}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(entreprise)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(entreprise.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Modifier Entreprise</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Raison Sociale*</label>
                <input
                  type="text"
                  name="raison_sociale"
                  value={formData.raison_sociale}
                  onChange={handleInputChange}
                  placeholder="Nom de l'entreprise"
                />
              </div>

              <div className="form-group">
                <label>Siège Social</label>
                <input
                  type="text"
                  name="siege"
                  value={formData.siege}
                  onChange={handleInputChange}
                  placeholder="Adresse"
                />
              </div>

              <div className="form-group">
                <label>Contact*</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Téléphone"
                />
              </div>

              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email professionnel"
                />
              </div>

              <div className="form-group">
                <label>Numéro d'Identification (NIF/RCS)</label>
                <input
                  type="text"
                  name="numero_identification"
                  value={formData.numero_identification}
                  onChange={handleInputChange}
                  placeholder="NIF ou RCS"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  Mettre à jour
                </button>
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
