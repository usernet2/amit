import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminSensibilisations.css';

export default function AdminSensibilisations() {
  const navigate = useNavigate();
  const [sensibilisations, setSensibilisations] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adherentSearch, setAdherentSearch] = useState('');
  const [filteredAdherents, setFilteredAdherents] = useState([]);
  const [formData, setFormData] = useState({
    sujet: '',
    date: '',
    adherent_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sensRes = await adminServiceV2.getSensibilisations();
      setSensibilisations(sensRes.data);
      // Don't fetch all enterprises - search on demand
      setAdherents([]);
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

    if (!formData.sujet || !formData.date || !formData.adherent_id) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      if (editingId) {
        await adminServiceV2.updateSensibilisation(editingId, formData);
        alert('Sensibilisation mise à jour');
      } else {
        await adminServiceV2.createSensibilisation(formData);
        alert('Sensibilisation créée');
      }
      setFormData({ sujet: '', date: '', adherent_id: '' });
      setEditingId(null);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving sensibilisation:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (sensibilisation) => {
    setFormData({
      sujet: sensibilisation.sujet,
      date: sensibilisation.date,
      adherent_id: sensibilisation.adherent_id,
    });
    setEditingId(sensibilisation.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr ?')) {
      try {
        await adminServiceV2.deleteSensibilisation(id);
        alert('Sensibilisation supprimée');
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
    setFormData({ sujet: '', date: '', adherent_id: '' });
    setAdherentSearch('');
    setFilteredAdherents([]);
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
            <h1 style={{ margin: 0 }}>📢 Gestion des Sensibilisations</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              setFormData({ sujet: '', date: '', lieu: '' });
              setEditingId(null);
              setShowModal(true);
            }}
          >
            ➕ Nouvelle Sensibilisation
          </button>
        </div>

        <div className="sensibilisations-table">
        {sensibilisations.length === 0 ? (
          <p>Aucune sensibilisation trouvée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Adhérant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensibilisations.map((s) => (
                <tr key={s.id}>
                  <td>{s.sujet}</td>
                  <td>{s.adherent_nom}</td>
                  <td>{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className={`status ${s.is_valid ? 'active' : 'inactive'}`}>
                      {s.is_valid ? 'Active' : 'Annulée'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(s)}
                      disabled={!s.is_valid}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(s.id)}
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
              <h2>{editingId ? 'Modifier Sensibilisation' : 'Nouvelle Sensibilisation'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Sujet*</label>
                <input
                  type="text"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleInputChange}
                  placeholder="Sujet de la sensibilisation"
                />
              </div>
              <div className="form-group">
                <label>Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Adhérent*</label>
                <input
                  type="text"
                  placeholder="Tapez le numéro ou le nom (ex: 2 ou Entreprise 2)..."
                  value={adherentSearch}
                  onChange={async (e) => {
                    const searchValue = e.target.value;
                    setAdherentSearch(searchValue);
                    if (searchValue.trim()) {
                      try {
                        const res = await adminServiceV2.searchEntreprises(searchValue);
                        setFilteredAdherents(res.data);
                      } catch (error) {
                        console.error('Error searching enterprises:', error);
                      }
                    } else {
                      setFilteredAdherents([]);
                    }
                  }}
                />
                {filteredAdherents.length > 0 && (
                  <div style={{ border: '1px solid #ddd', maxHeight: '250px', overflowY: 'auto', marginTop: '5px', backgroundColor: 'white', zIndex: 10 }}>
                    {filteredAdherents.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setFormData({ ...formData, adherent_id: a.id });
                          setAdherentSearch(a.raison_sociale);
                          setFilteredAdherents([]);
                        }}
                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: formData.adherent_id === a.id ? '#e8f4f8' : 'white' }}
                      >
                        {a.raison_sociale}
                      </div>
                    ))}
                  </div>
                )}
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
