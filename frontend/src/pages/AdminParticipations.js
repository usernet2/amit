import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminCommon.css';

export default function AdminParticipations() {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [formations, setFormations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    formation_id: '',
    adherent_id: '',
    date_deb: '',
    date_fin: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partRes, adhRes, formRes] = await Promise.all([
        adminServiceV2.getParticipations(),
        adminServiceV2.getEntreprises(),
        adminServiceV2.getFormations(),
      ]);
      setParticipations(partRes.data);
      setAdherents(adhRes.data);
      setFormations(formRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchParticipations = async () => {
    try {
      const response = await adminServiceV2.getParticipations();
      setParticipations(response.data);
    } catch (error) {
      console.error('Error fetching participations:', error);
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

    if (!formData.formation_id || !formData.adherent_id) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      if (editingId) {
        await adminServiceV2.updateParticipation(editingId, formData);
        alert('Participation mise à jour');
      } else {
        await adminServiceV2.createParticipation(formData);
        alert('Participation créée');
      }
      setFormData({ formation_id: '', adherent_id: '', date_deb: '', date_fin: '' });
      setEditingId(null);
      setShowModal(false);
      fetchParticipations();
    } catch (error) {
      console.error('Error saving participation:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (participation) => {
    setFormData({
      formation_id: participation.formation_id,
      adherent_id: participation.adherent_id,
      date_deb: participation.date_deb,
      date_fin: participation.date_fin,
    });
    setEditingId(participation.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await adminServiceV2.deleteParticipation(id);
        alert('Participation supprimée');
        fetchParticipations();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Erreur');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ formation_id: '', adherent_id: '', date_deb: '', date_fin: '' });
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
            <h1 style={{ margin: 0 }}>👥 Gestion des Participations</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              setFormData({ formation_id: '', adherent_id: '', date_deb: '', date_fin: '' });
              setEditingId(null);
              setShowModal(true);
            }}
          >
            ➕ Nouvelle Participation
          </button>
        </div>

        <div className="participations-table">
        {participations.length === 0 ? (
          <p>Aucune participation trouvée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Formation</th>
                <th>Adhérant</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((p) => (
                <tr key={p.id}>
                  <td>{p.formation_designation}</td>
                  <td>{p.adherent_nom}</td>
                  <td>{new Date(p.date_deb).toLocaleDateString('fr-FR')}</td>
                  <td>{new Date(p.date_fin).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`status ${p.status === 'complété' ? 'active' : 'inactive'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(p)}
                      disabled={p.status === 'annulé'}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(p.id)}
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
              <h2>{editingId ? 'Modifier Participation' : 'Nouvelle Participation'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Formation*</label>
                <select
                  name="formation_id"
                  value={formData.formation_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Sélectionner une formation --</option>
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.designation}
                    </option>
                  ))}
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
                  {adherents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.raison_sociale}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date Début*</label>
                <input
                  type="date"
                  name="date_deb"
                  value={formData.date_deb}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date Fin*</label>
                <input
                  type="date"
                  name="date_fin"
                  value={formData.date_fin}
                  onChange={handleInputChange}
                  required
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
