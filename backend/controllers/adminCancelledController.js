const pool = require('../config/database');

// Get all cancelled activities
exports.getCancelledActivities = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get cancelled formations
    const [cancelledFormations] = await connection.execute(`
      SELECT 
        f.id,
        f.designation,
        f.description,
        'formation' as type,
        COUNT(DISTINCT p.adherent_id) as adherents_count,
        f.updated_at as cancelled_at
      FROM formations f
      LEFT JOIN participer p ON f.id = p.formation_id
      WHERE p.is_valid = false
      GROUP BY f.id
    `);

    // Get cancelled participations
    const [cancelledParticipations] = await connection.execute(`
      SELECT 
        p.id,
        p.date_deb,
        p.date_fin,
        f.designation as formation_designation,
        f.id as formation_id,
        a.raison_sociale as adherent_nom,
        a.id as adherent_id,
        'participation' as type,
        p.updated_at as cancelled_at
      FROM participer p
      JOIN formations f ON p.formation_id = f.id
      JOIN adherents a ON p.adherent_id = a.id
      WHERE p.is_valid = false
    `);

    // Get cancelled visites d'entreprise
    const [cancelledVisitesEntreprise] = await connection.execute(`
      SELECT 
        ve.id,
        ve.date_heure,
        a.raison_sociale as adherent_nom,
        a.id as adherent_id,
        'visite_entreprise' as type,
        ve.updated_at as cancelled_at
      FROM visite_entreprise ve
      JOIN adherents a ON ve.adherent_id = a.id
      WHERE ve.is_valid = false
    `);

    // Get cancelled visites systématiques
    const [cancelledVisitesSystematique] = await connection.execute(`
      SELECT 
        vs.id,
        vs.date_deb,
        vs.date_fin,
        a.raison_sociale as adherent_nom,
        a.id as adherent_id,
        'visite_systematique' as type,
        vs.updated_at as cancelled_at
      FROM visite_systematique vs
      JOIN adherents a ON vs.adherent_id = a.id
      WHERE vs.is_valid = false
    `);

    // Get cancelled sensibilisations
    const [cancelledSensibilisations] = await connection.execute(`
      SELECT 
        s.id,
        s.sujet,
        s.date,
        s.adherent_id,
        a.raison_sociale as adherent_nom,
        c.nom as centre_nom,
        'sensibilisation' as type,
        s.updated_at as cancelled_at
      FROM sensibilisations s
      LEFT JOIN adherents a ON s.adherent_id = a.id
      LEFT JOIN centres c ON s.centre_id = c.id
      WHERE s.is_valid = false
    `);

    connection.release();

    res.status(200).json({
      formations: cancelledFormations,
      participations: cancelledParticipations,
      visites_entreprise: cancelledVisitesEntreprise,
      visites_systematique: cancelledVisitesSystematique,
      sensibilisations: cancelledSensibilisations,
      total: {
        formations: cancelledFormations.length,
        participations: cancelledParticipations.length,
        visites_entreprise: cancelledVisitesEntreprise.length,
        visites_systematique: cancelledVisitesSystematique.length,
        sensibilisations: cancelledSensibilisations.length,
      },
    });
  } catch (error) {
    console.error('Get cancelled activities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Replan activity (reactivate with new dates)
exports.replanifyActivity = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { date_heure, date_deb, date_fin, sujet, date } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Activity ID required' });
    }

    const connection = await pool.getConnection();
    let updateQuery, table;

    switch (type) {
      case 'visite_entreprise':
        if (!date_heure) {
          connection.release();
          return res.status(400).json({ message: 'date_heure required' });
        }
        table = 'visite_entreprise';
        await connection.execute(
          'UPDATE visite_entreprise SET is_valid = true, date_heure = ? WHERE id = ?',
          [date_heure, id]
        );
        break;

      case 'visite_systematique':
        if (!date_deb || !date_fin) {
          connection.release();
          return res.status(400).json({ message: 'date_deb and date_fin required' });
        }
        table = 'visite_systematique';
        await connection.execute(
          'UPDATE visite_systematique SET is_valid = true, date_deb = ?, date_fin = ? WHERE id = ?',
          [date_deb, date_fin, id]
        );
        break;

      case 'sensibilisation':
        if (!date) {
          connection.release();
          return res.status(400).json({ message: 'date required' });
        }
        table = 'sensibilisations';
        await connection.execute(
          'UPDATE sensibilisations SET is_valid = true, date = ? WHERE id = ?',
          [date, id]
        );
        break;

      case 'participation':
        if (!date_deb || !date_fin) {
          connection.release();
          return res.status(400).json({ message: 'date_deb and date_fin required' });
        }
        table = 'participer';
        await connection.execute(
          'UPDATE participer SET is_valid = true, date_deb = ?, date_fin = ? WHERE id = ?',
          [date_deb, date_fin, id]
        );
        break;

      case 'formation':
        table = 'formations';
        // Replan formation - reactivate and reactivate all its participations
        const [participations] = await connection.execute(
          'SELECT id FROM participer WHERE formation_id = ? AND is_valid = false',
          [id]
        );
        await connection.execute(
          'UPDATE formations SET is_valid = true WHERE id = ?',
          [id]
        );
        // Reactivate all cancelled participations for this formation
        if (participations.length > 0) {
          for (const participation of participations) {
            await connection.execute(
              'UPDATE participer SET is_valid = true WHERE id = ?',
              [participation.id]
            );
          }
        }
        break;

      default:
        connection.release();
        return res.status(400).json({ message: 'Invalid activity type' });
    }

    connection.release();

    res.status(200).json({
      message: `${type} replanned successfully`,
      id: id,
      type: type,
    });
  } catch (error) {
    console.error('Replanify activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel activity
exports.cancelActivity = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    const connection = await pool.getConnection();

    switch (type) {
      case 'visite_entreprise':
        await connection.execute(
          'UPDATE visite_entreprise SET is_valid = false WHERE id = ?',
          [id]
        );
        break;

      case 'visite_systematique':
        await connection.execute(
          'UPDATE visite_systematique SET is_valid = false WHERE id = ?',
          [id]
        );
        break;

      case 'sensibilisation':
        await connection.execute(
          'UPDATE sensibilisations SET is_valid = false WHERE id = ?',
          [id]
        );
        break;

      case 'participation':
        await connection.execute(
          'UPDATE participer SET is_valid = false WHERE id = ?',
          [id]
        );
        break;

      case 'formation':
        await connection.execute(
          'UPDATE formations SET is_valid = false WHERE id = ?',
          [id]
        );
        break;

      default:
        connection.release();
        return res.status(400).json({ message: 'Invalid activity type' });
    }

    connection.release();

    res.status(200).json({
      message: `${type} cancelled successfully`,
      id: id,
      type: type,
    });
  } catch (error) {
    console.error('Cancel activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
