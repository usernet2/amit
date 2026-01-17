const pool = require('../config/database');

// ADMIN - Gestion complète
exports.getDashboard = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM centres) as totalCentres,
        (SELECT COUNT(*) FROM adherents) as totalEntreprises,
        (SELECT COUNT(*) FROM formations) as totalFormations,
        (SELECT COUNT(*) FROM visite_entreprise) as visitesActive,
        (SELECT COUNT(*) FROM sensibilisations) as sensibilisationsActive
    `);

    connection.release();
    res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all cancelled activities
exports.getCancelledActivities = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [activities] = await connection.execute(`
      SELECT 'visite_entreprise' as type, ve.id, ve.date_heure as date, ve.adherent_id
      FROM visite_entreprise ve
      WHERE ve.is_valid = false
    `);

    connection.release();
    res.status(200).json(activities);
  } catch (error) {
    console.error('Get cancelled activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Replan activity
exports.replanActivity = async (req, res) => {
  try {
    const { type, id, newDate } = req.body;

    if (!type || !id || !newDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    if (type === 'visite_entreprise') {
      await connection.execute(
        'UPDATE visite_entreprise SET date_heure = ?, is_valid = true WHERE id = ?',
        [newDate, id]
      );
    } else if (type === 'formation') {
      await connection.execute(
        'UPDATE participer SET date_deb = ?, is_valid = true WHERE id = ?',
        [newDate, id]
      );
    } else if (type === 'sensibilisation') {
      await connection.execute(
        'UPDATE sensibilisations SET date = ?, is_valid = true WHERE id = ?',
        [newDate, id]
      );
    }

    connection.release();
    res.status(200).json({ message: 'Activity replanned successfully' });
  } catch (error) {
    console.error('Replan activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
