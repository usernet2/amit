const pool = require('../config/database');

// Get all visites (both types)
exports.getVisites = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get visite d'entreprise
    const [visitesEntreprise] = await connection.execute(`
      SELECT 
        ve.id,
        ve.date_heure,
        ve.adherent_id,
        a.raison_sociale as adherent_nom,
        'entreprise' as type,
        ve.is_valid,
        ve.created_at,
        ve.updated_at
      FROM visite_entreprise ve
      LEFT JOIN adherents a ON ve.adherent_id = a.id
    `);

    // Get visite systématique
    const [visitesSystematique] = await connection.execute(`
      SELECT 
        vs.id,
        vs.date_deb,
        vs.date_fin,
        vs.adherent_id,
        a.raison_sociale as adherent_nom,
        'systematique' as type,
        vs.is_valid,
        vs.created_at,
        vs.updated_at
      FROM visite_systematique vs
      LEFT JOIN adherents a ON vs.adherent_id = a.id
    `);

    connection.release();

    res.status(200).json({
      visiteEntreprise: visitesEntreprise,
      visiteSystematique: visitesSystematique,
    });
  } catch (error) {
    console.error('Get visites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create visite d'entreprise
exports.createVisiteEntreprise = async (req, res) => {
  try {
    const { adherent_id, date_heure } = req.body;

    if (!adherent_id || !date_heure) {
      return res.status(400).json({ message: 'adherent_id and date_heure required' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'INSERT INTO visite_entreprise (date_heure, adherent_id, is_valid) VALUES (?, ?, true)',
      [date_heure, adherent_id]
    );

    connection.release();

    res.status(201).json({
      message: 'Visite created',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Create visite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create visite systématique
exports.createVisiteSystematique = async (req, res) => {
  try {
    const { adherent_id, date_deb, date_fin } = req.body;

    if (!adherent_id || !date_deb || !date_fin) {
      return res.status(400).json({ message: 'adherent_id, date_deb, date_fin required' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'INSERT INTO visite_systematique (date_deb, date_fin, adherent_id, is_valid) VALUES (?, ?, ?, true)',
      [date_deb, date_fin, adherent_id]
    );

    connection.release();

    res.status(201).json({
      message: 'Visite systématique created',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Create visite systématique error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update visite
exports.updateVisite = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { adherent_id, date_heure, date_deb, date_fin } = req.body;

    const connection = await pool.getConnection();
    let query, params;

    if (type === 'entreprise') {
      if (!date_heure) {
        connection.release();
        return res.status(400).json({ message: 'date_heure required' });
      }

      const [existing] = await connection.execute(
        'SELECT id FROM visite_entreprise WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Visite not found' });
      }

      await connection.execute(
        'UPDATE visite_entreprise SET date_heure = ?, adherent_id = ? WHERE id = ?',
        [date_heure, adherent_id || null, id]
      );
    } else if (type === 'systematique') {
      if (!date_deb || !date_fin) {
        connection.release();
        return res.status(400).json({ message: 'date_deb and date_fin required' });
      }

      const [existing] = await connection.execute(
        'SELECT id FROM visite_systematique WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Visite not found' });
      }

      await connection.execute(
        'UPDATE visite_systematique SET date_deb = ?, date_fin = ?, adherent_id = ? WHERE id = ?',
        [date_deb, date_fin, adherent_id || null, id]
      );
    }

    connection.release();

    res.status(200).json({ message: 'Visite updated' });
  } catch (error) {
    console.error('Update visite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete visite (soft delete)
exports.deleteVisite = async (req, res) => {
  try {
    const { type, id } = req.params;

    const connection = await pool.getConnection();
    let table = type === 'entreprise' ? 'visite_entreprise' : 'visite_systematique';

    const [existing] = await connection.execute(
      `SELECT id FROM ${table} WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Visite not found' });
    }

    await connection.execute(
      `UPDATE ${table} SET is_valid = false WHERE id = ?`,
      [id]
    );

    connection.release();

    res.status(200).json({ message: 'Visite deleted' });
  } catch (error) {
    console.error('Delete visite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
