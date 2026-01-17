const pool = require('../config/database');

// ADHÉRANT - Vue personnelle
exports.getDashboard = async (req, res) => {
  try {
    const adherentId = req.user?.adherentId;
    
    if (!adherentId) {
      return res.status(400).json({ message: 'Adherent ID not found' });
    }

    const connection = await pool.getConnection();

    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM visite_entreprise WHERE adherent_id = ? AND is_valid = true) as visitesActive,
        (SELECT COUNT(*) FROM participer WHERE adherent_id = ? AND is_valid = true) as formationsActive,
        (SELECT COUNT(*) FROM sensibilisations WHERE adherent_id = ? AND is_valid = true) as sensibilisationsActive
    `, [adherentId, adherentId, adherentId]);

    connection.release();
    res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Adhérant Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my visites
exports.getMyVisites = async (req, res) => {
  try {
    const adherentId = req.user?.adherentId;
    
    if (!adherentId) {
      return res.status(400).json({ message: 'Adherent ID not found' });
    }

    const connection = await pool.getConnection();

    // Get visites entreprise
    const [visitesEntreprise] = await connection.execute(`
      SELECT id, date_heure as date_deb, observations, is_valid, 'entreprise' as type
      FROM visite_entreprise
      WHERE adherent_id = ?
      ORDER BY date_heure ASC
    `, [adherentId]);

    // Get visites systématiques
    const [visitesSystematiques] = await connection.execute(`
      SELECT id, date_deb, date_fin, observations, is_valid, 'systematique' as type
      FROM visite_systematique
      WHERE adherent_id = ?
      ORDER BY date_deb ASC
    `, [adherentId]);

    connection.release();
    
    const allVisites = [...visitesSystematiques, ...visitesEntreprise];
    res.status(200).json(allVisites);
  } catch (error) {
    console.error('Get my visites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my formations
exports.getMyFormations = async (req, res) => {
  try {
    const adherentId = req.user?.adherentId;
    
    if (!adherentId) {
      return res.status(400).json({ message: 'Adherent ID not found' });
    }

    const connection = await pool.getConnection();

    // My participations - formations où il participe
    const [myFormations] = await connection.execute(`
      SELECT 
        f.id, f.designation, f.description,
        p.id as participation_id, p.date_deb, p.date_fin, p.is_valid
      FROM participer p
      JOIN formations f ON p.formation_id = f.id
      WHERE p.adherent_id = ?
      ORDER BY p.date_deb ASC
    `, [adherentId]);

    // All available formations
    const [allFormations] = await connection.execute(`
      SELECT id, designation, description
      FROM formations
      ORDER BY designation ASC
    `);

    connection.release();
    res.status(200).json({
      myFormations,
      availableFormations: allFormations
    });
  } catch (error) {
    console.error('Get my formations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my sensibilisations
exports.getMySensibilisations = async (req, res) => {
  try {
    const adherentId = req.user?.adherentId;
    
    if (!adherentId) {
      return res.status(400).json({ message: 'Adherent ID not found' });
    }

    const connection = await pool.getConnection();

    const [sensibilisations] = await connection.execute(`
      SELECT id, sujet, date, is_valid, description
      FROM sensibilisations
      WHERE adherent_id = ?
      ORDER BY date ASC
    `, [adherentId]);

    connection.release();
    res.status(200).json(sensibilisations);
  } catch (error) {
    console.error('Get my sensibilisations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel visite
exports.cancelVisite = async (req, res) => {
  try {
    const { id } = req.params;
    const adherentId = req.user.adherentId;

    const connection = await pool.getConnection();

    // Verify ownership
    const [visites] = await connection.execute(
      'SELECT id FROM visite_entreprise WHERE id = ? AND adherent_id = ?',
      [id, adherentId]
    );

    if (visites.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Visite not found' });
    }

    await connection.execute(
      'UPDATE visite_entreprise SET is_valid = false WHERE id = ?',
      [id]
    );

    connection.release();
    res.status(200).json({ message: 'Visite cancelled successfully' });
  } catch (error) {
    console.error('Cancel visite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel formation participation
exports.cancelFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const adherentId = req.user.adherentId;

    const connection = await pool.getConnection();

    // Verify ownership
    const [participations] = await connection.execute(
      'SELECT id FROM participer WHERE id = ? AND adherent_id = ?',
      [id, adherentId]
    );

    if (participations.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Formation not found' });
    }

    await connection.execute(
      'UPDATE participer SET is_valid = false WHERE id = ?',
      [id]
    );

    connection.release();
    res.status(200).json({ message: 'Formation cancelled successfully' });
  } catch (error) {
    console.error('Cancel formation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel sensibilisation
exports.cancelSensibilisation = async (req, res) => {
  try {
    const { id } = req.params;
    const adherentId = req.user.adherentId;

    const connection = await pool.getConnection();

    // Verify ownership
    const [sensibilisations] = await connection.execute(
      'SELECT id FROM sensibilisations WHERE id = ? AND adherent_id = ?',
      [id, adherentId]
    );

    if (sensibilisations.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sensibilisation not found' });
    }

    await connection.execute(
      'UPDATE sensibilisations SET is_valid = false WHERE id = ?',
      [id]
    );

    connection.release();
    res.status(200).json({ message: 'Sensibilisation cancelled successfully' });
  } catch (error) {
    console.error('Cancel sensibilisation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
