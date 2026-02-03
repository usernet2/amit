import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { medecinChefServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/MedecinChefDashboard.css';

export default function MedecinChefDashboard() {
  const [stats, setStats] = useState(null);
  const [visites, setVisites] = useState([]);
  const [formations, setFormations] = useState([]);
  const [sensibilisations, setSensibilisations] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visites');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const statsRes = await medecinChefServiceV2.getDashboard();
      setStats(statsRes.data);

      const visitesRes = await medecinChefServiceV2.getVisites(month, year);
      setVisites(visitesRes.data);

      const formationsRes = await medecinChefServiceV2.getFormations(month, year);
      setFormations(formationsRes.data);

      const sensibilisationsRes = await medecinChefServiceV2.getSensibilisations(month, year);
      setSensibilisations(sensibilisationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    authServiceV2.logout();
    navigate('/login');
  };

  if (loading) return <div className="medecin-container"><div className="dashboard-content"><p>Loading...</p></div></div>;

  return (
    <div className="medecin-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>🩺 Médecin Chef Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalEntreprises || 0}</h3>
          <p>Entreprises Affiliées</p>
        </div>
      </div>

      {/* Month/Year Filter */}
      <div className="filter-section">
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          placeholder="Month"
        />
        <input
          type="number"
          min="2020"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          placeholder="Year"
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'visites' ? 'active' : ''}`}
          onClick={() => setActiveTab('visites')}
        >
          🏢 Visites ({visites.length})
        </button>
        <button
          className={`tab ${activeTab === 'formations' ? 'active' : ''}`}
          onClick={() => setActiveTab('formations')}
        >
          🎓 Formations ({formations.length})
        </button>
        <button
          className={`tab ${activeTab === 'sensibilisations' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensibilisations')}
        >
          📢 Sensibilisations ({sensibilisations.length})
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {activeTab === 'visites' && (
          <div className="tab-content">
            <h2>🏢 Visites - {month}/{year}</h2>
            {visites.length === 0 ? (
              <p>Aucune visite</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entreprise</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {visites.map((visite) => (
                    <tr key={visite.id}>
                      <td>{new Date(visite.date_heure).toLocaleString()}</td>
                      <td>{visite.raison_sociale}</td>
                      <td>{visite.contact}</td>
                      <td>{visite.email}</td>
                      <td>{visite.is_valid ? '✅ Active' : '❌ Annulée'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'formations' && (
          <div className="tab-content">
            <h2>🎓 Formations - {month}/{year}</h2>
            {formations.length === 0 ? (
              <p>Aucune formation</p>
            ) : (
              <div className="formations-list">
                {formations.map((formation) => (
                  <div key={formation.id} className="formation-card">
                    <h3>{formation.designation}</h3>
                    <p>{formation.description}</p>
                    {formation.participation_id && (
                      <div className="participation">
                        <p><strong>Entreprise:</strong> {formation.raison_sociale}</p>
                        <p><strong>Dates:</strong> {new Date(formation.date_deb).toLocaleDateString()} - {new Date(formation.date_fin).toLocaleDateString()}</p>
                        <p><strong>Statut:</strong> {formation.is_valid ? '✅ Actif' : '❌ Annulé'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sensibilisations' && (
          <div className="tab-content">
            <h2>📢 Sensibilisations - {month}/{year}</h2>
            {sensibilisations.length === 0 ? (
              <p>Aucune sensibilisation</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sujet</th>
                    <th>Date</th>
                    <th>Entreprise</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sensibilisations.map((sens) => (
                    <tr key={sens.id}>
                      <td>{sens.sujet}</td>
                      <td>{new Date(sens.date).toLocaleDateString()}</td>
                      <td>{sens.raison_sociale || 'N/A'}</td>
                      <td>{sens.is_valid ? '✅ Active' : '❌ Annulée'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
