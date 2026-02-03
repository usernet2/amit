const pool = require('../config/database');

// MÉDECIN CHEF - Vue par centre
exports.getDashboard = async (req, res) => {
  try {
    const centreId = req.user?.centreId || req.user?.adherent_id;
    
    if (!centreId) {
      return res.status(400).json({ message: 'Centre ID not found' });
    }

    const connection = await pool.getConnection();

    const [enterprises] = await connection.execute(
      'SELECT COUNT(*) as total FROM adherents WHERE dispensaire_id = ?',
      [centreId]
    );

    const [visits] = await connection.execute(
      'SELECT COUNT(*) as total FROM visite_entreprise ve JOIN adherents a ON ve.adherent_id = a.id WHERE a.dispensaire_id = ?',
      [centreId]
    );

    const [formations] = await connection.execute(
      'SELECT COUNT(DISTINCT f.id) as total FROM formations f LEFT JOIN participer p ON f.id = p.formation_id LEFT JOIN adherents a ON p.adherent_id = a.id WHERE a.dispensaire_id = ?',
      [centreId]
    );

    const [sensibilisations] = await connection.execute(
      'SELECT COUNT(*) as total FROM sensibilisations WHERE centre_id = ?',
      [centreId]
    );

    connection.release();
    
    res.status(200).json({
      totalEntreprises: enterprises[0]?.total || 0,
      visitesActive: visits[0]?.total || 0,
      formations: formations[0]?.total || 0,
      sensibilisations: sensibilisations[0]?.total || 0
    });
  } catch (error) {
    console.error('Médecin Chef Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get centre visites (monthly view)
exports.getVisites = async (req, res) => {
  try {
    const centreId = req.user.centreId || req.user.adherent_id;
    const { month, year } = req.query;

    if (!centreId) {
      return res.status(400).json({ message: 'Centre ID not found' });
    }

    const connection = await pool.getConnection();

    const [visites] = await connection.execute(`
      SELECT 
        ve.id, ve.date_heure, a.raison_sociale, a.contact, a.email, ve.is_valid
      FROM visite_entreprise ve
      JOIN adherents a ON ve.adherent_id = a.id
      WHERE a.dispensaire_id = ?
      AND YEAR(ve.date_heure) = ?
      AND MONTH(ve.date_heure) = ?
      ORDER BY ve.date_heure ASC
    `, [centreId, year || new Date().getFullYear(), month || new Date().getMonth() + 1]);

    connection.release();
    res.status(200).json(visites);
  } catch (error) {
    console.error('Get visites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get centre formations (monthly view)
exports.getFormations = async (req, res) => {
  try {
    const centreId = req.user.centreId || req.user.adherent_id;
    const { month, year } = req.query;

    if (!centreId) {
      return res.status(400).json({ message: 'Centre ID not found' });
    }

    const connection = await pool.getConnection();

    const [formations] = await connection.execute(`
      SELECT 
        f.id, f.designation, f.description,
        p.id as participation_id, p.date_deb, p.date_fin, p.is_valid,
        a.raison_sociale, a.contact
      FROM formations f
      LEFT JOIN participer p ON f.id = p.formation_id
      LEFT JOIN adherents a ON p.adherent_id = a.id
      WHERE a.dispensaire_id = ?
      AND YEAR(p.date_deb) = ?
      AND MONTH(p.date_deb) = ?
      AND p.is_valid = true
      ORDER BY p.date_deb ASC
    `, [centreId, year || new Date().getFullYear(), month || new Date().getMonth() + 1]);

    connection.release();
    res.status(200).json(formations);
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get centre sensibilisations (monthly view)
exports.getSensibilisations = async (req, res) => {
  try {
    const centreId = req.user.centreId || req.user.adherent_id;
    const { month, year } = req.query;

    if (!centreId) {
      return res.status(400).json({ message: 'Centre ID not found' });
    }

    const connection = await pool.getConnection();

    const [sensibilisations] = await connection.execute(`
      SELECT 
        s.id, s.sujet, s.date, s.is_valid,
        a.raison_sociale
      FROM sensibilisations s
      LEFT JOIN adherents a ON s.adherent_id = a.id
      WHERE s.centre_id = ?
      AND YEAR(s.date) = ?
      AND MONTH(s.date) = ?
      AND s.is_valid = true
      ORDER BY s.date ASC
    `, [centreId, year || new Date().getFullYear(), month || new Date().getMonth() + 1]);

    connection.release();
    res.status(200).json(sensibilisations);
  } catch (error) {
    console.error('Get sensibilisations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
