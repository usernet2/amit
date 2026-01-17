const pool = require('../config/database');

// Get formations for adhérant (participated + all available)
exports.getFormations = async (req, res) => {
  try {
    const { adherentId } = req.user;
    const connection = await pool.getConnection();

    // Get formations adhérant participates to
    const [participantFormations] = await connection.execute(`
      SELECT 
        f.id, 
        f.designation, 
        f.description,
        p.date_deb,
        p.date_fin,
        p.is_valid,
        p.id as participation_id
      FROM formations f
      INNER JOIN participer p ON f.id = p.formation_id
      WHERE p.adherent_id = ? AND p.is_valid = true
    `, [adherentId]);

    // Get all available formations
    const [allFormations] = await connection.execute(`
      SELECT id, designation, description
      FROM formations
    `);

    connection.release();

    res.status(200).json({
      participated: participantFormations,
      available: allFormations,
    });
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Enroll in a formation
exports.enrollFormation = async (req, res) => {
  try {
    const { formationId, date_deb, date_fin } = req.body;
    const { adherentId } = req.user;
    const connection = await pool.getConnection();

    // Check if already enrolled
    const [existing] = await connection.execute(
      'SELECT id FROM participer WHERE formation_id = ? AND adherent_id = ?',
      [formationId, adherentId]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Already enrolled in this formation' });
    }

    await connection.execute(
      'INSERT INTO participer (formation_id, adherent_id, date_deb, date_fin, is_valid) VALUES (?, ?, ?, ?, true)',
      [formationId, adherentId, date_deb, date_fin]
    );

    connection.release();
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll formation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel formation participation
exports.cancelFormation = async (req, res) => {
  try {
    const { participationId } = req.body;
    const { adherentId } = req.user;
    const connection = await pool.getConnection();

    // Verify ownership
    const [participations] = await connection.execute(
      'SELECT id FROM participer WHERE id = ? AND adherent_id = ?',
      [participationId, adherentId]
    );

    if (participations.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Participation not found' });
    }

    await connection.execute(
      'UPDATE participer SET is_valid = false WHERE id = ?',
      [participationId]
    );

    connection.release();
    res.status(200).json({ message: 'Participation cancelled successfully' });
  } catch (error) {
    console.error('Cancel formation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
