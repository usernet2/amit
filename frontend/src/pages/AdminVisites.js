import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminVisites.css';

export default function AdminVisites() {
  const navigate = useNavigate();
  const [visites, setVisites] = useState({ visiteEntreprise: [], visiteSystematique: [] });
  const [adherants, setAdherants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visitType, setVisitType] = useState('entreprise');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    adherent_id: '',
    date_heure: '',
    date_deb: '',
    date_fin: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitesRes, adherantsRes] = await Promise.all([
        adminServiceV2.getVisites(),
        adminServiceV2.getEntreprises(),
      ]);
      setVisites(visitesRes.data);
      setAdherants(adherantsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
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

    try {
      if (visitType === 'entreprise') {
        if (!formData.adherent_id || !formData.date_heure) {
          alert('Veuillez remplir tous les champs requis');
          return;
        }
        if (editingId) {
          await adminServiceV2.updateVisite('entreprise', editingId, {
            adherent_id: formData.adherent_id,
            date_heure: formData.date_heure,
          });
          alert('Visite mise à jour');
        } else {
          await adminServiceV2.createVisiteEntreprise({
            adherent_id: formData.adherent_id,
            date_heure: formData.date_heure,
          });
          alert('Visite créée');
        }
      } else {
        if (!formData.adherent_id || !formData.date_deb || !formData.date_fin) {
          alert('Veuillez remplir tous les champs requis');
          return;
        }
        if (editingId) {
          await adminServiceV2.updateVisite('systematique', editingId, {
            adherent_id: formData.adherent_id,
            date_deb: formData.date_deb,
            date_fin: formData.date_fin,
          });
          alert('Visite mise à jour');
        } else {
          await adminServiceV2.createVisiteSystematique({
            adherent_id: formData.adherent_id,
            date_deb: formData.date_deb,
            date_fin: formData.date_fin,
          });
          alert('Visite créée');
        }
      }
      setFormData({ adherent_id: '', date_heure: '', date_deb: '', date_fin: '' });
      setEditingId(null);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving visite:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (visite, type) => {
    setFormData({
      adherent_id: visite.adherent_id,
      date_heure: visite.date_heure || '',
      date_deb: visite.date_deb || '',
      date_fin: visite.date_fin || '',
    });
    setVisitType(type);
    setEditingId(visite.id);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await adminServiceV2.deleteVisite(type, id);
        alert('Visite supprimée');
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Erreur');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ adherent_id: '', date_heure: '', date_deb: '', date_fin: '' });
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
            <h1 style={{ margin: 0 }}>📅 Gestion des Visites</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              setFormData({ adherant_id: '', date_heure: '', date_deb: '', date_fin: '' });
              setEditingId(null);
              setVisitType('entreprise');
              setShowModal(true);
            }}
          >
            + Nouvelle Visite
          </button>
        </div>

        <div className="visites-section">
        <h2>Visites d'Entreprise</h2>
        {visites.visiteEntreprise.length === 0 ? (
          <p>Aucune visite d'entreprise</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Adhérant</th>
                <th>Date/Heure</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visites.visiteEntreprise.map((v) => (
                <tr key={v.id}>
                  <td>{v.adherent_nom}</td>
                  <td>{new Date(v.date_heure).toLocaleString('fr-FR')}</td>
                  <td>
                    <span className={`status ${v.is_valid ? 'active' : 'inactive'}`}>
                      {v.is_valid ? 'Active' : 'Annulée'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(v, 'entreprise')}
                      disabled={!v.is_valid}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(v.id, 'entreprise')}
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

      <div className="visites-section">
        <h2>Visites Systématiques</h2>
        {visites.visiteSystematique.length === 0 ? (
          <p>Aucune visite systématique</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Adhérant</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visites.visiteSystematique.map((v) => (
                <tr key={v.id}>
                  <td>{v.adherent_nom}</td>
                  <td>{new Date(v.date_deb).toLocaleDateString('fr-FR')}</td>
                  <td>{new Date(v.date_fin).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`status ${v.is_valid ? 'active' : 'inactive'}`}>
                      {v.is_valid ? 'Active' : 'Annulée'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(v, 'systematique')}
                      disabled={!v.is_valid}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(v.id, 'systematique')}
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
              <h2>{editingId ? 'Modifier Visite' : 'Nouvelle Visite'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Type de Visite</label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  disabled={editingId}
                >
                  <option value="entreprise">Visite d'Entreprise</option>
                  <option value="systematique">Visite Systématique</option>
                </select>
              </div>

              <div className="form-group">
                <label>Adhérant*</label>
                <select
                  name="adherent_id"
                  value={formData.adherent_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Sélectionner un adhérant --</option>
                  {adherants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.raison_sociale}
                    </option>
                  ))}
                </select>
              </div>

              {visitType === 'entreprise' ? (
                <div className="form-group">
                  <label>Date et Heure*</label>
                  <input
                    type="datetime-local"
                    name="date_heure"
                    value={formData.date_heure}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Date Début*</label>
                    <input
                      type="date"
                      name="date_deb"
                      value={formData.date_deb}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Fin*</label>
                    <input
                      type="date"
                      name="date_fin"
                      value={formData.date_fin}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

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
