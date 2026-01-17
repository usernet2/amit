const pool = require('../config/database');

// Get all visits for an adhérent
exports.getVisites = async (req, res) => {
  try {
    const { adherentId } = req.user;
    const connection = await pool.getConnection();

    // Get visite d'entreprise
    const [visitesEntreprise] = await connection.execute(
      'SELECT id, date_heure, is_valid FROM visite_entreprise WHERE adherent_id = ? AND is_valid = true',
      [adherentId]
    );

    // Get visite systématique
    const [visiteSystematique] = await connection.execute(
      'SELECT id, date_deb, date_fin, is_valid FROM visite_systematique WHERE adherent_id = ? AND is_valid = true',
      [adherentId]
    );

    connection.release();

    res.status(200).json({
      visiteEntreprise: visitesEntreprise,
      visiteSystematique: visiteSystematique,
    });
  } catch (error) {
    console.error('Get visites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a visite d'entreprise or visite systématique
exports.cancelVisite = async (req, res) => {
  try {
    const { id, type } = req.body; // type: 'entreprise' or 'systematique'
    const { adherentId } = req.user;
    const connection = await pool.getConnection();

    if (type === 'entreprise') {
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
    } else if (type === 'systematique') {
      // Verify ownership
      const [visites] = await connection.execute(
        'SELECT id FROM visite_systematique WHERE id = ? AND adherent_id = ?',
        [id, adherentId]
      );

      if (visites.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'Visite not found' });
      }

      await connection.execute(
        'UPDATE visite_systematique SET is_valid = false WHERE id = ?',
        [id]
      );
    }

    connection.release();
    res.status(200).json({ message: 'Visite cancelled successfully' });
  } catch (error) {
    console.error('Cancel visite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
