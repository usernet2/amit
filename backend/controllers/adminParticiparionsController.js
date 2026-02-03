const pool = require('../config/database');

// Get all participations
exports.getParticipations = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [participations] = await connection.execute(`
      SELECT 
        p.id,
        p.date_deb,
        p.date_fin,
        p.is_valid,
        CASE WHEN p.is_valid = true THEN 'complété' ELSE 'annulé' END as status,
        f.designation as formation_designation,
        f.id as formation_id,
        a.raison_sociale as adherent_nom,
        a.id as adherent_id,
        p.created_at,
        p.updated_at
      FROM participer p
      JOIN formations f ON p.formation_id = f.id
      JOIN adherents a ON p.adherent_id = a.id
      ORDER BY p.date_deb DESC
    `);

    connection.release();

    res.status(200).json(participations);
  } catch (error) {
    console.error('Get participations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create participation
exports.createParticipation = async (req, res) => {
  try {
    const { formation_id, adherent_id, date_deb, date_fin } = req.body;
    
    console.log('Received participation data:', { formation_id, adherent_id, date_deb, date_fin });

    if (!formation_id || !adherent_id || !date_deb || !date_fin) {
      return res
        .status(400)
        .json({ message: 'formation_id, adherent_id, date_deb, date_fin required' });
    }

    const connection = await pool.getConnection();

    // Verify formation exists
    const [formationCheck] = await connection.execute(
      'SELECT id FROM formations WHERE id = ?',
      [formation_id]
    );

    if (formationCheck.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Formation not found' });
    }

    // Verify adherent exists
    const [adherentCheck] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [adherent_id]
    );

    if (adherentCheck.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Adherent not found' });
    }

    // Insert participation record
    const [result] = await connection.execute(
      'INSERT INTO participer (date_deb, date_fin, formation_id, adherent_id, is_valid) VALUES (?, ?, ?, ?, true)',
      [date_deb, date_fin, formation_id, adherent_id]
    );

    connection.release();

    res.status(201).json({
      message: 'Participation created',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Create participation error:', error);
    console.error('Error details:', { message: error.message, code: error.code, sql: error.sql });
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Cette participation existe déjà pour cet adhérant et cette formation' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update participation
exports.updateParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { formation_id, adherent_id, date_deb, date_fin } = req.body;

    if (!formation_id && !adherent_id && !date_deb && !date_fin) {
      return res.status(400).json({ message: 'At least one field required' });
    }

    const connection = await pool.getConnection();

    // Verify participation exists
    const [existing] = await connection.execute(
      'SELECT id FROM participer WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Participation not found' });
    }

    // Verify formation exists if updating
    if (formation_id) {
      const [formationCheck] = await connection.execute(
        'SELECT id FROM formations WHERE id = ? AND is_valid = true',
        [formation_id]
      );

      if (formationCheck.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Formation not found' });
      }
    }

    // Verify adherent exists if updating
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

    if (formation_id) {
      updateFields.push('formation_id = ?');
      updateValues.push(formation_id);
    }
    if (adherent_id) {
      updateFields.push('adherent_id = ?');
      updateValues.push(adherent_id);
    }
    if (date_deb) {
      updateFields.push('date_deb = ?');
      updateValues.push(date_deb);
    }
    if (date_fin) {
      updateFields.push('date_fin = ?');
      updateValues.push(date_fin);
    }

    updateValues.push(id);

    await connection.execute(
      `UPDATE participer SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    connection.release();

    res.status(200).json({ message: 'Participation updated' });
  } catch (error) {
    console.error('Update participation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete participation (soft delete)
exports.deleteParticipation = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM participer WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Participation not found' });
    }

    await connection.execute(
      'UPDATE participer SET is_valid = false WHERE id = ?',
      [id]
    );

    connection.release();

    res.status(200).json({ message: 'Participation deleted' });
  } catch (error) {
    console.error('Delete participation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
