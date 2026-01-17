import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminFormations.css';

export default function AdminFormations() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    designation: '',
    description: '',
  });

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await adminServiceV2.getFormations();
      setFormations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching formations:', error);
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

    if (!formData.designation.trim()) {
      alert('Le nom de la formation est requis');
      return;
    }

    try {
      if (editingId) {
        await adminServiceV2.updateFormation(editingId, formData);
        alert('Formation mise à jour avec succès');
      } else {
        await adminServiceV2.createFormation(formData);
        alert('Formation créée avec succès');
      }
      setFormData({ designation: '', description: '' });
      setEditingId(null);
      setShowModal(false);
      fetchFormations();
    } catch (error) {
      console.error('Error saving formation:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (formation) => {
    setFormData({
      designation: formation.designation,
      description: formation.description,
    });
    setEditingId(formation.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await adminServiceV2.deleteFormation(id);
        alert('Formation supprimée');
        fetchFormations();
      } catch (error) {
        console.error('Error deleting formation:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ designation: '', description: '' });
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
            <h1 style={{ margin: 0 }}>📚 Gestion des Formations</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              setFormData({ designation: '', description: '' });
              setEditingId(null);
              setShowModal(true);
            }}
          >
            ➕ Nouvelle Formation
          </button>
        </div>

        <div className="formations-table">
        {formations.length === 0 ? (
          <p>Aucune formation trouvée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Designation</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formations.map((formation) => (
                <tr key={formation.id}>
                  <td>{formation.designation}</td>
                  <td>{formation.description}</td>
                  <td>
                    <span className={`status ${formation.is_valid ? 'active' : 'inactive'}`}>
                      {formation.is_valid ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(formation)}
                      disabled={!formation.is_valid}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(formation.id)}
                    >
                      🗑️ Supprimer
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
              <h2>{editingId ? 'Modifier Formation' : 'Nouvelle Formation'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Designation*</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Nom de la formation"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description détaillée"
                  rows="4"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Mettre à jour' : 'Créer'}
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
