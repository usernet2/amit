import React, { useState, useEffect } from 'react';
import { sensibilisationsService } from '../services/api';

function SensibilisationsModal({ onClose }) {
  const [sensibilisations, setSensibilisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSensibilisations();
  }, []);

  const fetchSensibilisations = async () => {
    try {
      setLoading(true);
      const response = await sensibilisationsService.getSensibilisations();
      setSensibilisations(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des sensibilisations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await sensibilisationsService.cancelSensibilisation(id);
      setSuccessMsg('Sensibilisation annulée avec succès');
      fetchSensibilisations();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>📢 Sensibilisations</h2>
        {error && <div className="error">{error}</div>}
        {successMsg && <div className="success">{successMsg}</div>}

        {sensibilisations.length === 0 ? (
          <p className="empty-state">Aucune sensibilisation prévue cette année</p>
        ) : (
          <ul className="items-list">
            {sensibilisations.map(s => (
              <li key={s.id} className="item">
                <div className="item-info">
                  <h4>{s.sujet}</h4>
                  <p>{new Date(s.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <button
                  className="btn-cancel"
                  onClick={() => handleCancel(s.id)}
                >
                  Annuler
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-footer">
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default SensibilisationsModal;
