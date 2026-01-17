const pool = require('../config/database');

// Get all sensibilisations
exports.getSensibilisations = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [sensibilisations] = await connection.execute(`
      SELECT 
        s.id,
        s.sujet,
        s.date,
        s.adherent_id,
        a.raison_sociale as adherent_nom,
        c.nom as centre_nom,
        s.is_valid,
        s.created_at,
        s.updated_at
      FROM sensibilisations s
      LEFT JOIN adherents a ON s.adherent_id = a.id
      LEFT JOIN centres c ON s.centre_id = c.id
      ORDER BY s.date DESC
    `);

    connection.release();

    res.status(200).json(sensibilisations);
  } catch (error) {
    console.error('Get sensibilisations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create sensibilisation
exports.createSensibilisation = async (req, res) => {
  try {
    const { sujet, date, adherent_id } = req.body;

    if (!sujet || !date || !adherent_id) {
      return res.status(400).json({ message: 'sujet, date, adherent_id required' });
    }

    const connection = await pool.getConnection();

    // Verify adherent exists
    const [adherentCheck] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [adherent_id]
    );

    if (adherentCheck.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Adherent not found' });
    }

    const [result] = await connection.execute(
      'INSERT INTO sensibilisations (sujet, date, adherent_id, is_valid) VALUES (?, ?, ?, true)',
      [sujet, date, adherent_id]
    );

    connection.release();

    res.status(201).json({
      message: 'Sensibilisation created',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Create sensibilisation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update sensibilisation
exports.updateSensibilisation = async (req, res) => {
  try {
    const { id } = req.params;
    const { sujet, date, adherent_id } = req.body;

    if (!sujet && !date && !adherent_id) {
      return res.status(400).json({ message: 'At least one field required' });
    }

    const connection = await pool.getConnection();

    // Verify sensibilisation exists
    const [existing] = await connection.execute(
      'SELECT id FROM sensibilisations WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sensibilisation not found' });
    }

    // If updating adherent, verify it exists
    if (adherent_id) {
      const [adherentCheck] = await connection.execute(
        'SELECT id FROM adherents WHERE id = ?',
        [adherent_id]
      );

      if (adherentCheck.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Adherent not found' });
      }
    }

    let updateFields = [];
    let updateValues = [];

    if (sujet) {
      updateFields.push('sujet = ?');
      updateValues.push(sujet);
    }
    if (date) {
      updateFields.push('date = ?');
      updateValues.push(date);
    }
    if (adherent_id) {
      updateFields.push('adherent_id = ?');
      updateValues.push(adherent_id);
    }

    updateValues.push(id);

    await connection.execute(
      `UPDATE sensibilisations SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    connection.release();

    res.status(200).json({ message: 'Sensibilisation updated' });
  } catch (error) {
    console.error('Update sensibilisation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete sensibilisation (soft delete)
exports.deleteSensibilisation = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM sensibilisations WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sensibilisation not found' });
    }

    await connection.execute(
      'UPDATE sensibilisations SET is_valid = false WHERE id = ?',
      [id]
    );

    connection.release();

    res.status(200).json({ message: 'Sensibilisation deleted' });
  } catch (error) {
    console.error('Delete sensibilisation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
