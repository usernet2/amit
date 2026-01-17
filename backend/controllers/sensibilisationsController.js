const pool = require('../config/database');

// Get sensibilisations for current year
exports.getSensibilisations = async (req, res) => {
  try {
    const { adherentId } = req.user;
    const currentYear = new Date().getFullYear();
    const connection = await pool.getConnection();

    const [sensibilisations] = await connection.execute(`
      SELECT id, sujet, date, is_valid
      FROM sensibilisations
      WHERE adherent_id = ? 
      AND YEAR(date) = ?
      AND is_valid = true
    `, [adherentId, currentYear]);

    connection.release();

    res.status(200).json(sensibilisations);
  } catch (error) {
    console.error('Get sensibilisations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if adhérant has any sensibilisations this year
exports.hasSensibilisations = async (req, res) => {
  try {
    const { adherentId } = req.user;
    const currentYear = new Date().getFullYear();
    const connection = await pool.getConnection();

    const [result] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM sensibilisations
      WHERE adherent_id = ? 
      AND YEAR(date) = ?
      AND is_valid = true
    `, [adherentId, currentYear]);

    connection.release();

    res.status(200).json({
      hasSensibilisations: result[0].count > 0,
      count: result[0].count,
    });
  } catch (error) {
    console.error('Check sensibilisations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a sensibilisation
exports.cancelSensibilisation = async (req, res) => {
  try {
    const { id } = req.body;
    const { adherentId } = req.user;
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
