import React, { useState, useEffect } from 'react';
import { formationsService } from '../services/api';

function FormationsModal({ onClose }) {
  const [formations, setFormations] = useState({
    participated: [],
    available: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedAccordions, setExpandedAccordions] = useState({
    participated: true,
    available: false,
  });

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const response = await formationsService.getFormations();
      setFormations(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (participationId) => {
    try {
      await formationsService.cancelFormation(participationId);
      setSuccessMsg('Participation annulée avec succès');
      fetchFormations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  const toggleAccordion = (key) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>🎓 Formations</h2>
        {error && <div className="error">{error}</div>}
        {successMsg && <div className="success">{successMsg}</div>}

        <div className="accordion">
          {/* Formations Participées */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${expandedAccordions.participated ? 'active' : ''}`}
              onClick={() => toggleAccordion('participated')}
            >
              ✅ Mes Formations ({formations.participated.length})
              <span>{expandedAccordions.participated ? '▼' : '▶'}</span>
            </div>
            <div className={`accordion-content ${expandedAccordions.participated ? 'active' : ''}`}>
              <div className="accordion-body">
                {formations.participated.length === 0 ? (
                  <p className="empty-state">Vous n'êtes inscrit à aucune formation</p>
                ) : (
                  <ul className="items-list">
                    {formations.participated.map(f => (
                      <li key={f.participation_id} className="item">
                        <div className="item-info">
                          <h4>{f.designation}</h4>
                          <p>{f.description}</p>
                          <p>Du {new Date(f.date_deb).toLocaleDateString('fr-FR')} au {new Date(f.date_fin).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(f.participation_id)}
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

          {/* Formations Disponibles */}
          <div className="accordion-item">
            <div 
              className={`accordion-header ${expandedAccordions.available ? 'active' : ''}`}
              onClick={() => toggleAccordion('available')}
            >
              📚 Formations Disponibles ({formations.available.length})
              <span>{expandedAccordions.available ? '▼' : '▶'}</span>
            </div>
            <div className={`accordion-content ${expandedAccordions.available ? 'active' : ''}`}>
              <div className="accordion-body">
                {formations.available.length === 0 ? (
                  <p className="empty-state">Aucune formation disponible</p>
                ) : (
                  <ul className="items-list">
                    {formations.available.map(f => (
                      <li key={f.id} className="item">
                        <div className="item-info">
                          <h4>{f.designation}</h4>
                          <p>{f.description}</p>
                        </div>
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

export default FormationsModal;
