import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminServiceV2, authServiceV2 } from '../services/api';
import '../styles/UnifiedStyle.css';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [participationsCount, setParticipationsCount] = useState(0);
  const [cancelledActivities, setCancelledActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replanKey, setReplanKey] = useState(null);
  const [newDate, setNewDate] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const statsRes = await adminServiceV2.getDashboard();
      setStats(statsRes.data);
      
      try {
        const participationsRes = await adminServiceV2.getParticipations();
        setParticipationsCount(participationsRes.data ? participationsRes.data.length : 0);
      } catch (partError) {
        console.error('Error fetching participations:', partError);
        setParticipationsCount(0);
      }
      
      try {
        const activitiesRes = await adminServiceV2.getCancelledActivities();
        const data = activitiesRes.data;
        
        let allCancelled = [];
        
        // Handle both response formats
        if (Array.isArray(data)) {
          // If response is a simple array, ensure it has proper structure
          allCancelled = data.map(item => ({
            ...item,
            type: item.type || 'unknown'
          }));
        } else if (data && typeof data === 'object') {
          // If response is structured with separate categories
          allCancelled = [
            ...(data.participations || []).map(p => ({ ...p, type: 'participation' })),
            ...(data.visites_entreprise || []).map(v => ({ ...v, type: 'visite_entreprise' })),
            ...(data.visites_systematique || []).map(v => ({ ...v, type: 'visite_systematique' })),
            ...(data.sensibilisations || []).map(s => ({ ...s, type: 'sensibilisation' })),
          ];
        }
        
        setCancelledActivities(allCancelled);
      } catch (cancelledError) {
        console.error('Error fetching cancelled activities:', cancelledError);
        setCancelledActivities([]);
      }
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

  const handleReplan = async () => {
    if (!newDate) {
      alert('Veuillez sélectionner une date');
      return;
    }

    try {
      const activity = cancelledActivities.find(a => `${a.type}-${a.id}` === replanKey);
      
      if (!activity) {
        alert('Activité non trouvée');
        return;
      }
      
      // Build data object based on activity type
      let data = {};
      if (activity.type === 'visite_entreprise') {
        data.date_heure = newDate;
      } else if (activity.type === 'visite_systematique') {
        data.date_deb = newDate;
        data.date_fin = newDate;
      } else if (activity.type === 'sensibilisation') {
        data.date = newDate;
      } else if (activity.type === 'participation') {
        data.date_deb = newDate;
        data.date_fin = newDate;
      }
      
      console.log('Sending replan request:', { type: activity.type, id: activity.id, data });
      
      await adminServiceV2.replanActivity(activity.type, activity.id, data);
      alert('Activité replanifiée avec succès!');
      setReplanKey(null);
      setNewDate('');
      fetchData();
    } catch (error) {
      console.error('Error replanning activity:', error);
      alert('Erreur lors du replanification');
    }
  };

  const handleLogout = () => {
    authServiceV2.logout();
    navigate('/login');
  };

  if (loading) return <div className="admin-container"><div className="dashboard-content"><p>Loading...</p></div></div>;

  return (
    <div className="admin-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>👨‍💼 Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-danger">🚪 Déconnexion</button>
        </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalCentres || 0}</h3>
          <p>Centres</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalEntreprises || 0}</h3>
          <p>Entreprises</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalFormations || 0}</h3>
          <p>Formations</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.visitesActive || 0}</h3>
          <p>Visites Actives</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.sensibilisationsActive || 0}</h3>
          <p>Sensibilisations</p>
        </div>
        <div className="stat-card">
          <h3>{participationsCount}</h3>
          <p>Participations</p>
        </div>
      </div>

      {/* Management Section */}
      <div className="management-section" style={{ marginBottom: '30px', marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>📋 Gestion</h2>
        <div className="management-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          <button 
            onClick={() => navigate('/admin/participations')}
            className="btn btn-primary"
            style={{ fontSize: '0.95rem', padding: '12px' }}
          >
            👥 Formations
          </button>
          <button 
            onClick={() => navigate('/admin/visites')}
            className="btn btn-primary"
            style={{ fontSize: '0.95rem', padding: '12px' }}
          >
            📅 Visites
          </button>
          <button 
            onClick={() => navigate('/admin/sensibilisations')}
            className="btn btn-primary"
            style={{ fontSize: '0.95rem', padding: '12px' }}
          >
            📢 Sensibilisations
          </button>
        </div>
      </div>

      {/* Cancelled Activities */}
      <div className="cancelled-section">
        <h2>❌ Activités Annulées</h2>
        
        {cancelledActivities.length === 0 ? (
          <p>Aucune activité annulée</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Détails</th>
                <th>Entreprise</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancelledActivities.map((activity) => (
                <tr key={`${activity.type}-${activity.id}`}>
                  <td>
                    {activity.type === 'formation' && '📚'}
                    {activity.type === 'participation' && '👥'}
                    {activity.type === 'visite_entreprise' && '🏢'}
                    {activity.type === 'visite_systematique' && '📋'}
                    {activity.type === 'sensibilisation' && '📢'}
                    {' '}{activity.type.replace('_', ' ')}
                  </td>
                  <td>
                    {activity.designation || activity.formation_designation || activity.sujet || '-'}
                  </td>
                  <td>{activity.raison_sociale || activity.adherent_nom || '-'}</td>
                  <td>
                    {activity.date ? new Date(activity.date).toLocaleDateString('fr-FR') :
                     activity.date_heure ? new Date(activity.date_heure).toLocaleDateString('fr-FR') :
                     activity.date_deb ? new Date(activity.date_deb).toLocaleDateString('fr-FR') :
                     '-'}
                  </td>
                  <td>
                    {replanKey === `${activity.type}-${activity.id}` ? (
                      <div className="replan-form" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          style={{ padding: '6px', flex: 1 }}
                        />
                        <button onClick={handleReplan} className="btn-confirm" style={{ padding: '6px 12px' }}>✓</button>
                        <button onClick={() => setReplanKey(null)} className="btn-cancel" style={{ padding: '6px 12px' }}>✗</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplanKey(`${activity.type}-${activity.id}`)}
                        className="btn-replan"
                        style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                      >
                        📅 Planifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
}
