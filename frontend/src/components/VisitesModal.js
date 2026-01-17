import React, { useState, useEffect } from 'react';
import { visitesService } from '../services/api';

function VisitesModal({ onClose }) {
  const [visites, setVisites] = useState({
    visiteEntreprise: [],
    visiteSystematique: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchVisites();
  }, []);

  const fetchVisites = async () => {
    try {
      setLoading(true);
      const response = await visitesService.getVisites();
      setVisites(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des visites');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, type) => {
    try {
      await visitesService.cancelVisite(id, type);
      setSuccessMsg('Visite annulée avec succès');
      fetchVisites();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>📅 Mes Visites</h2>
        {error && <div className="error">{error}</div>}
        {successMsg && <div className="success">{successMsg}</div>}

        <div className="accordion">
          {/* Visite d'Entreprise */}
          <div className="accordion-item">
            <div className="accordion-header">
              🏭 Visites d'Entreprise ({visites.visiteEntreprise.length})
            </div>
            <div className="accordion-content active">
              <div className="accordion-body">
                {visites.visiteEntreprise.length === 0 ? (
                  <p className="empty-state">Aucune visite d'entreprise prévue</p>
                ) : (
                  <ul className="items-list">
                    {visites.visiteEntreprise.map(visite => (
                      <li key={visite.id} className="item">
                        <div className="item-info">
                          <p>{new Date(visite.date_heure).toLocaleString('fr-FR')}</p>
                        </div>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(visite.id, 'entreprise')}
                        >
                          Annuler
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Visite Systématique */}
          <div className="accordion-item">
            <div className="accordion-header">
              📋 Visites Systématiques ({visites.visiteSystematique.length})
            </div>
            <div className="accordion-content active">
              <div className="accordion-body">
                {visites.visiteSystematique.length === 0 ? (
                  <p className="empty-state">Aucune visite systématique prévue</p>
                ) : (
                  <ul className="items-list">
                    {visites.visiteSystematique.map(visite => (
                      <li key={visite.id} className="item">
                        <div className="item-info">
                          <p>Du {new Date(visite.date_deb).toLocaleDateString('fr-FR')} au {new Date(visite.date_fin).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(visite.id, 'systematique')}
                        >
                          Annuler
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default VisitesModal;
