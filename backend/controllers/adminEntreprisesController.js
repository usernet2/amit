const pool = require('../config/database');

// Get all enterprises (adhérants)
exports.getAll = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [enterprises] = await connection.execute(`
      SELECT 
        a.id,
        a.raison_sociale,
        a.siege,
        a.contact,
        a.email,
        a.dispensaire_id,
        a.created_at,
        a.updated_at
      FROM adherents a
      ORDER BY a.raison_sociale ASC
    `);

    connection.release();

    res.status(200).json(enterprises);
  } catch (error) {
    console.error('Get enterprises error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single enterprise
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [enterprises] = await connection.execute(`
      SELECT 
        a.id,
        a.raison_sociale,
        a.siege,
        a.contact,
        a.email,
        a.dispensaire_id,
        a.created_at,
        a.updated_at
      FROM adherents a
      WHERE a.id = ?
    `, [id]);

    connection.release();

    if (enterprises.length === 0) {
      return res.status(404).json({ message: 'Enterprise not found' });
    }

    res.status(200).json(enterprises[0]);
  } catch (error) {
    console.error('Get enterprise error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update enterprise
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { raison_sociale, siege, contact, email } = req.body;

    // Validation
    if (!raison_sociale || !contact || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if enterprise exists
    const [enterprises] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [id]
    );

    if (enterprises.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Enterprise not found' });
    }

    // Update enterprise
    await connection.execute(
      `UPDATE adherents 
       SET raison_sociale = ?, siege = ?, contact = ?, email = ?
       WHERE id = ?`,
      [raison_sociale, siege || null, contact, email, id]
    );

    connection.release();

    res.status(200).json({ message: 'Enterprise updated successfully' });
  } catch (error) {
    console.error('Update enterprise error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete enterprise (soft delete - keep data integrity)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if enterprise exists
    const [enterprises] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [id]
    );

    if (enterprises.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Enterprise not found' });
    }

    // Delete enterprise
    await connection.execute(
      'DELETE FROM adherents WHERE id = ?',
      [id]
    );

    connection.release();

    res.status(200).json({ message: 'Enterprise deleted successfully' });
  } catch (error) {
    console.error('Delete enterprise error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get enterprise statistics
exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Get visites d'entreprise count
    const [visitesEntreprise] = await connection.execute(
      'SELECT COUNT(*) as count FROM visite_entreprise WHERE adherent_id = ? AND is_valid = true',
      [id]
    );

    // Get visites systématiques count
    const [visiteSystematique] = await connection.execute(
      'SELECT COUNT(*) as count FROM visite_systematique WHERE adherent_id = ? AND is_valid = true',
      [id]
    );

    // Get formations count
    const [formations] = await connection.execute(
      'SELECT COUNT(*) as count FROM participer WHERE adherent_id = ? AND is_valid = true',
      [id]
    );

    // Get sensibilisations count
    const [sensibilisations] = await connection.execute(
      'SELECT COUNT(*) as count FROM sensibilisations WHERE adherent_id = ? AND is_valid = true',
      [id]
    );

    connection.release();

    res.status(200).json({
      visiteEntreprise: visitesEntreprise[0].count,
      visiteSystematique: visiteSystematique[0].count,
      formations: formations[0].count,
      sensibilisations: sensibilisations[0].count,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search enterprises (for performance in forms)
exports.search = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const connection = await pool.getConnection();

    const [enterprises] = await connection.execute(`
      SELECT 
        a.id,
        a.raison_sociale
      FROM adherents a
      WHERE a.raison_sociale LIKE ?
      ORDER BY a.raison_sociale ASC
      LIMIT 20
    `, [`%${q}%`]);

    connection.release();

    res.status(200).json(enterprises);
  } catch (error) {
    console.error('Search enterprises error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
