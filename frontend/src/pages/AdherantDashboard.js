import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adherantServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdherantDashboard.css';

function AdherantDashboard() {
  const [stats, setStats] = useState(null);
  const [visites, setVisites] = useState([]);
  const [formations, setFormations] = useState({});
  const [sensibilisations, setSensibilisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const statsRes = await adherantServiceV2.getDashboard();
      setStats(statsRes.data);

      const visitesRes = await adherantServiceV2.getVisites();
      setVisites(visitesRes.data);

      const formationsRes = await adherantServiceV2.getFormations();
      // Gérer à la fois le format tableau et le format objet
      if (Array.isArray(formationsRes.data)) {
        setFormations({ myFormations: formationsRes.data, availableFormations: [] });
      } else {
        setFormations(formationsRes.data);
      }

      const sensibilisationsRes = await adherantServiceV2.getSensibilisations();
      setSensibilisations(sensibilisationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancel = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler?')) return;

    try {
      if (type === 'visite') {
        await adherantServiceV2.cancelVisite(id);
      } else if (type === 'formation') {
        await adherantServiceV2.cancelFormation(id);
      } else if (type === 'sensibilisation') {
        await adherantServiceV2.cancelSensibilisation(id);
      }
      alert('Annulation réussie!');
      fetchData();
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const handleLogout = () => {
    authServiceV2.logout();
    navigate('/login');
  };

  const toggleAccordion = (key) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) return <div className="adherant-container"><div className="dashboard-content"><p>Chargement...</p></div></div>;

  return (
    <div className="adherant-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>🏭 Tableau de Bord Entreprise</h1>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

        {/* Main Buttons */}
        <div className="main-buttons">
        <button
          className={`main-btn ${activeSection === 'visites' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'visites' ? null : 'visites')}
        >
          <span className="btn-icon">📅</span>
          <span>Visites</span>
        </button>
        <button
          className={`main-btn ${activeSection === 'formations' ? 'active' : ''}`}
          onClick={() => setActiveSection(activeSection === 'formations' ? null : 'formations')}
        >
          <span className="btn-icon">📚</span>
          <span>Formations ({(formations.myFormations?.length || 0) + (formations.availableFormations?.length || 0)})</span>
        </button>
        {sensibilisations.length > 0 && (
          <button
            className={`main-btn ${activeSection === 'sensibilisations' ? 'active' : ''}`}
            onClick={() => setActiveSection(activeSection === 'sensibilisations' ? null : 'sensibilisations')}
          >
            <span className="btn-icon">📢</span>
            <span>Sensibilisations</span>
          </button>
        )}
      </div>

      {/* Content Section - Only show when a section is selected */}
      {activeSection && (
        <div className="content-section">
          {/* Visites Section */}
          {activeSection === 'visites' && (
            <div className="visits-container">
              {/* Visites Systématiques */}
              <div className="accordion-section">
                <button 
                  className={`accordion-button ${expandedAccordions['systematique'] ? 'expanded' : ''}`}
                  onClick={() => toggleAccordion('systematique')}
                >
                  <span className="accordion-icon">
                    {expandedAccordions['systematique'] ? '▼' : '▶'}
                  </span>
                  <span>🔍 Visites Systématiques ({visites.filter(v => v.type === 'systematique').length})</span>
                </button>
                
                {expandedAccordions['systematique'] && (
                  <div className="accordion-content">
                    {visites.filter(v => v.type === 'systematique').length === 0 ? (
                      <p className="empty-state">Aucune visite systématique</p>
                    ) : (
                      <div className="cards-list">
                        {visites.filter(v => v.type === 'systematique').map((visite, idx) => (
                          <div key={visite.id} className="sensibilisation-card">
                            <div className="sens-header">
                              <h3>Visite Systématique {idx + 1}</h3>
                            </div>
                            <div className="sens-info">
                              <p><strong>📆 Période:</strong> {new Date(visite.date_deb).toLocaleDateString()} - {new Date(visite.date_fin).toLocaleDateString()}</p>
                              <p className={`status ${visite.is_valid ? 'active' : 'cancelled'}`}>
                                {visite.is_valid ? '✅ Confirmée' : '❌ Annulée'}
                              </p>
                            </div>
                            {visite.is_valid && (
                              <button
                                onClick={() => handleCancel('visite', visite.id)}
                                className="btn btn-danger btn-sm"
                              >
                                ✕ Annuler
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Visites Entreprise */}
              <div className="accordion-section">
                <button 
                  className={`accordion-button ${expandedAccordions['entreprise'] ? 'expanded' : ''}`}
                  onClick={() => toggleAccordion('entreprise')}
                >
                  <span className="accordion-icon">
                    {expandedAccordions['entreprise'] ? '▼' : '▶'}
                  </span>
                  <span>🏢 Visites Entreprise ({visites.filter(v => v.type === 'entreprise').length})</span>
                </button>
                
                {expandedAccordions['entreprise'] && (
                  <div className="accordion-content">
                    {visites.filter(v => v.type === 'entreprise').length === 0 ? (
                      <p className="empty-state">Aucune visite entreprise</p>
                    ) : (
                      <div className="cards-list">
                        {visites.filter(v => v.type === 'entreprise').map((visite, idx) => (
                          <div key={visite.id} className="sensibilisation-card">
                            <div className="sens-header">
                              <h3>Visite Entreprise {idx + 1}</h3>
                            </div>
                            <div className="sens-info">
                              <p><strong>📅 Date & Heure:</strong> {new Date(visite.date_heure).toLocaleString()}</p>
                              <p className={`status ${visite.is_valid ? 'active' : 'cancelled'}`}>
                                {visite.is_valid ? '✅ Confirmée' : '❌ Annulée'}
                              </p>
                            </div>
                            {visite.is_valid && (
                              <button
                                onClick={() => handleCancel('visite', visite.id)}
                                className="btn btn-danger btn-sm"
                              >
                                ✕ Annuler
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Formations Section */}
          {activeSection === 'formations' && (
            <div className="formations-container">
              {/* Mes Formations */}
              <div className="accordion-section">
                <button 
                  className={`accordion-button ${expandedAccordions['mesFormations'] ? 'expanded' : ''}`}
                  onClick={() => toggleAccordion('mesFormations')}
                >
                  <span className="accordion-icon">
                    {expandedAccordions['mesFormations'] ? '▼' : '▶'}
                  </span>
                  <span>✅ Mes Formations ({formations.myFormations?.length || 0})</span>
                </button>
                
                {expandedAccordions['mesFormations'] && (
                  <div className="accordion-content">
                    {formations.myFormations?.length === 0 ? (
                      <p className="empty-state">Aucune formation suivie</p>
                    ) : (
                      <div className="cards-list">
                        {formations.myFormations?.map((f) => (
                          <div key={f.participation_id} className="sensibilisation-card">
                            <div className="sens-header">
                              <h3>{f.designation}</h3>
                            </div>
                            <div className="sens-info">
                              <p className="formation-desc">{f.description}</p>
                              <p><strong>📅 Date:</strong> {new Date(f.date_deb).toLocaleDateString()} - {new Date(f.date_fin).toLocaleDateString()}</p>
                              <p className={`status ${f.is_valid ? 'active' : 'cancelled'}`}>
                                {f.is_valid ? '✅ Confirmée' : '❌ Annulée'}
                              </p>
                            </div>
                            {f.is_valid && (
                              <button
                                onClick={() => handleCancel('formation', f.participation_id)}
                                className="btn btn-danger btn-sm"
                              >
                                ✕ Annuler
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Formations Disponibles Accordion */}
              <div className="accordion-section">
                <button 
                  className={`accordion-button ${expandedAccordions['disponibles'] ? 'expanded' : ''}`}
                  onClick={() => toggleAccordion('disponibles')}
                >
                  <span className="accordion-icon">
                    {expandedAccordions['disponibles'] ? '▼' : '▶'}
                  </span>
                  <span>📚 Formations Disponibles ({formations.availableFormations?.length || 0})</span>
                </button>
                
                {expandedAccordions['disponibles'] && (
                  <div className="accordion-content">
                    {formations.availableFormations?.length === 0 ? (
                      <p className="empty-state">Aucune formation disponible</p>
                    ) : (
                      formations.availableFormations?.map((f) => (
                        <div key={f.id} className="accordion-section nested">
                          <button 
                            className={`accordion-button nested ${expandedAccordions[`avail-${f.id}`] ? 'expanded' : ''}`}
                            onClick={() => toggleAccordion(`avail-${f.id}`)}
                          >
                            <span className="accordion-icon">
                              {expandedAccordions[`avail-${f.id}`] ? '▼' : '▶'}
                            </span>
                            <span>{f.designation}</span>
                          </button>
                          
                          {expandedAccordions[`avail-${f.id}`] && (
                            <div className="accordion-content">
                              <div className="simple-item">
                                <p className="formation-desc">{f.description}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sensibilisations Section */}
          {activeSection === 'sensibilisations' && sensibilisations.length > 0 && (
            <div className="sensibilisations-container">
              {sensibilisations.length === 0 ? (
                <p className="empty-state">Aucune sensibilisation prévue</p>
              ) : (
                <div className="cards-list">
                  {sensibilisations.map((sens) => (
                    <div key={sens.id} className="sensibilisation-card">
                      <div className="sens-header">
                        <h3>{sens.sujet}</h3>
                      </div>
                      <div className="sens-info">
                        <p><strong>📅 Date:</strong> {new Date(sens.date).toLocaleDateString()}</p>
                        <p className={`status ${sens.is_valid ? 'active' : 'cancelled'}`}>
                          {sens.is_valid ? '✅ Confirmée' : '❌ Annulée'}
                        </p>
                      </div>
                      {sens.is_valid && (
                        <button
                          onClick={() => handleCancel('sensibilisation', sens.id)}
                          className="btn btn-danger btn-sm"
                        >
                          ✕ Annuler
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default AdherantDashboard;
