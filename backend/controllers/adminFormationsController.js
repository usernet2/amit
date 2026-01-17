const pool = require('../config/database');

// Get all formations
exports.getFormations = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [formations] = await connection.execute(
      'SELECT id, designation, description, created_at, updated_at FROM formations'
    );

    connection.release();

    res.status(200).json(formations);
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create formation
exports.createFormation = async (req, res) => {
  try {
    const { designation, description } = req.body;

    if (!designation) {
      return res.status(400).json({ message: 'Designation is required' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'INSERT INTO formations (designation, description) VALUES (?, ?)',
      [designation, description || null]
    );

    connection.release();

    res.status(201).json({
      message: 'Formation created',
      id: result.insertId,
      designation,
      description,
    });
  } catch (error) {
    console.error('Create formation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update formation
exports.updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designation, description } = req.body;

    if (!designation) {
      return res.status(400).json({ message: 'Designation is required' });
    }

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM formations WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Formation not found' });
    }

    await connection.execute(
      'UPDATE formations SET designation = ?, description = ? WHERE id = ?',
      [designation, description || null, id]
    );

    connection.release();

    res.status(200).json({ message: 'Formation updated' });
  } catch (error) {
    console.error('Update formation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete formation (soft delete - mark all participations as invalid)
exports.deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM formations WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Formation not found' });
    }

    // Mark all participations as invalid
    await connection.execute(
      'UPDATE participer SET is_valid = false WHERE formation_id = ?',
      [id]
    );

    connection.release();

    res.status(200).json({ message: 'Formation deleted (all participations cancelled)' });
  } catch (error) {
    console.error('Delete formation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
