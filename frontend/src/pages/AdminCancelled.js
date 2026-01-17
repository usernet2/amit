import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCancelled } from '../services/adminApi';
import { authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminCancelled.css';

export default function AdminCancelled() {
  const navigate = useNavigate();
  const [cancelled, setCancelled] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replanData, setReplanData] = useState({
    date_heure: '',
    date_deb: '',
    date_fin: '',
    sujet: '',
    date: '',
  });

  useEffect(() => {
    fetchCancelled();
  }, []);

  const fetchCancelled = async () => {
    try {
      const response = await adminCancelled.getAll();
      setCancelled(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cancelled activities:', error);
      setLoading(false);
    }
  };

  const handleReplanClick = (activity, type) => {
    setSelectedActivity({ ...activity, type });
    setReplanData({
      date_heure: activity.date_heure || '',
      date_deb: activity.date_deb || '',
      date_fin: activity.date_fin || '',
      sujet: activity.sujet || '',
      date: activity.date || '',
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReplanData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReplan = async (e) => {
    e.preventDefault();

    try {
      const data = {};
      if (selectedActivity.type === 'visite_entreprise') {
        if (!replanData.date_heure) {
          alert('Date/heure requise');
          return;
        }
        data.date_heure = replanData.date_heure;
      } else if (selectedActivity.type === 'visite_systematique') {
        if (!replanData.date_deb || !replanData.date_fin) {
          alert('Dates requises');
          return;
        }
        data.date_deb = replanData.date_deb;
        data.date_fin = replanData.date_fin;
      } else if (selectedActivity.type === 'sensibilisation') {
        if (!replanData.sujet || !replanData.date) {
          alert('Sujet et date requis');
          return;
        }
        data.sujet = replanData.sujet;
        data.date = replanData.date;
      } else if (selectedActivity.type === 'participation') {
        if (!replanData.date_deb || !replanData.date_fin) {
          alert('Dates requises');
          return;
        }
        data.date_deb = replanData.date_deb;
        data.date_fin = replanData.date_fin;
      }

      await adminCancelled.replanify(selectedActivity.type, selectedActivity.id, data);
      alert('Activité replannifiée avec succès');
      setShowModal(false);
      fetchCancelled();
    } catch (error) {
      console.error('Error replanifying:', error);
      alert('Erreur lors de la replanification');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
    setReplanData({
      date_heure: '',
      date_deb: '',
      date_fin: '',
      sujet: '',
      date: '',
    });
  };

  const handleLogout = () => {
    authServiceV2.logout();
    navigate('/login');
  };

  if (loading) return <div className="admin-container"><p>Chargement...</p></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Activités Annulées</h1>
          <p>Gestion des activités annulées et replanification</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
      </div>

      <div className="cancelled-stats">
        <div className="stat-box">
          <h3>Formations annulées</h3>
          <p>{cancelled.total?.formations || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Participations annulées</h3>
          <p>{cancelled.total?.participations || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Visites d'entreprise annulées</h3>
          <p>{cancelled.total?.visites_entreprise || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Visites systématiques annulées</h3>
          <p>{cancelled.total?.visites_systematique || 0}</p>
        </div>
        <div className="stat-box">
          <h3>Sensibilisations annulées</h3>
          <p>{cancelled.total?.sensibilisations || 0}</p>
        </div>
      </div>

      {/* Formations annulées */}
      <div className="cancelled-section">
        <h2>Formations Annulées</h2>
        {cancelled.formations?.length === 0 ? (
          <p>Aucune formation annulée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adhérants affectés</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelled.formations?.map((f) => (
                <tr key={f.id}>
                  <td>{f.designation}</td>
                  <td>{f.adherants_count}</td>
                  <td>
                    <button
                      className="btn-replan"
                      onClick={() => handleReplanClick(f, 'formation')}
                    >
                      🔄 Réactiver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Participations annulées */}
      <div className="cancelled-section">
        <h2>Participations Annulées</h2>
        {cancelled.participations?.length === 0 ? (
          <p>Aucune participation annulée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Formation</th>
                <th>Adhérant</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelled.participations?.map((p) => (
                <tr key={p.id}>
                  <td>{p.formation_designation}</td>
                  <td>{p.adherent_nom}</td>
                  <td>
                    {new Date(p.date_deb).toLocaleDateString('fr-FR')} →{' '}
                    {new Date(p.date_fin).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <button
                      className="btn-replan"
                      onClick={() => handleReplanClick(p, 'participation')}
                    >
                      🔄 Replanifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Visites d'entreprise annulées */}
      <div className="cancelled-section">
        <h2>Visites d'Entreprise Annulées</h2>
        {cancelled.visites_entreprise?.length === 0 ? (
          <p>Aucune visite d'entreprise annulée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Adhérant</th>
                <th>Date/Heure</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelled.visites_entreprise?.map((v) => (
                <tr key={v.id}>
                  <td>{v.adherent_nom}</td>
                  <td>{new Date(v.date_heure).toLocaleString('fr-FR')}</td>
                  <td>
                    <button
                      className="btn-replan"
                      onClick={() => handleReplanClick(v, 'visite_entreprise')}
                    >
                      🔄 Replanifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Visites systématiques annulées */}
      <div className="cancelled-section">
        <h2>Visites Systématiques Annulées</h2>
        {cancelled.visites_systematique?.length === 0 ? (
          <p>Aucune visite systématique annulée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Adhérant</th>
                <th>Période</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelled.visites_systematique?.map((v) => (
                <tr key={v.id}>
                  <td>{v.adherent_nom}</td>
                  <td>
                    {new Date(v.date_deb).toLocaleDateString('fr-FR')} →{' '}
                    {new Date(v.date_fin).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <button
                      className="btn-replan"
                      onClick={() => handleReplanClick(v, 'visite_systematique')}
                    >
                      🔄 Replanifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sensibilisations annulées */}
      <div className="cancelled-section">
        <h2>Sensibilisations Annulées</h2>
        {cancelled.sensibilisations?.length === 0 ? (
          <p>Aucune sensibilisation annulée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Adhérant</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelled.sensibilisations?.map((s) => (
                <tr key={s.id}>
                  <td>{s.sujet}</td>
                  <td>{s.adherent_nom}</td>
                  <td>{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <button
                      className="btn-replan"
                      onClick={() => handleReplanClick(s, 'sensibilisation')}
                    >
                      🔄 Replanifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de replanification */}
      {showModal && selectedActivity && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Replanifier l'activité</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleReplan}>
              {selectedActivity.type === 'visite_entreprise' && (
                <div className="form-group">
                  <label>Date et Heure*</label>
                  <input
                    type="datetime-local"
                    name="date_heure"
                    value={replanData.date_heure}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {selectedActivity.type === 'visite_systematique' && (
                <>
                  <div className="form-group">
                    <label>Date Début*</label>
                    <input
                      type="date"
                      name="date_deb"
                      value={replanData.date_deb}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Fin*</label>
                    <input
                      type="date"
                      name="date_fin"
                      value={replanData.date_fin}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {selectedActivity.type === 'sensibilisation' && (
                <>
                  <div className="form-group">
                    <label>Sujet*</label>
                    <input
                      type="text"
                      name="sujet"
                      value={replanData.sujet}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date*</label>
                    <input
                      type="date"
                      name="date"
                      value={replanData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {selectedActivity.type === 'participation' && (
                <>
                  <div className="form-group">
                    <label>Date Début*</label>
                    <input
                      type="date"
                      name="date_deb"
                      value={replanData.date_deb}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date Fin*</label>
                    <input
                      type="date"
                      name="date_fin"
                      value={replanData.date_fin}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  Replanifier
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
  );
}
