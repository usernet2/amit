const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check if adherent exists by raison_sociale and tel
exports.checkAdherent = async (req, res) => {
  try {
    const { raison_sociale, telephone } = req.body;

    if (!raison_sociale || !telephone) {
      return res.status(400).json({ message: 'raison_sociale and telephone required' });
    }

    const connection = await pool.getConnection();

    const [adherents] = await connection.execute(
      'SELECT id, raison_sociale, tel, contact FROM adherents WHERE raison_sociale = ? AND tel = ?',
      [raison_sociale, telephone]
    );

    connection.release();

    if (adherents.length === 0) {
      return res.status(404).json({ message: 'Adherent not found', found: false });
    }

    const adherent = adherents[0];
    res.status(200).json({ 
      found: true, 
      adherent_id: adherent.id,
      raison_sociale: adherent.raison_sociale,
      tel: adherent.tel,
      contact: adherent.contact
    });

  } catch (error) {
    console.error('Check adherent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register user with adherent_id
exports.registerUser = async (req, res) => {
  try {
    const { email, password, adherent_id } = req.body;

    // Validation
    if (!email || !password || !adherent_id) {
      return res.status(400).json({ message: 'Missing required fields: email, password, adherent_id' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const connection = await pool.getConnection();

    // Check if user email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Verify adherent exists
    const [adherents] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [adherent_id]
    );

    if (adherents.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Adherent not found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with adherent_id
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role, adherent_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'adherent', adherent_id]
    );

    connection.release();

    console.log(`✅ User registered: ${email} for adherent ${adherent_id}`);

    res.status(201).json({
      message: 'Account created successfully',
      userId: userResult.insertId,
      email: email
    });

  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login - Pour tous les rôles
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const connection = await pool.getConnection();

    // Get user
    const [users] = await connection.execute(
      'SELECT id, email, password, role, adherent_id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let additionalData = {};

    if (user.role === 'adherent') {
      // Get enterprise info
      const [adherants] = await connection.execute(
        'SELECT id, raison_sociale FROM adherants WHERE user_id = ?',
        [user.id]
      );
      if (adherants.length > 0) {
        additionalData.adherentId = adherants[0].id;
        additionalData.entreprise = adherants[0].raison_sociale;
      }
    } else if (user.role === 'medecin_chef') {
      additionalData.centreId = user.adherent_id;
    }

    connection.release();

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, adherentId: user.adherent_id, ...additionalData },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    let profile = { ...user };

    if (user.role === 'adherent') {
      const [adherents] = await connection.execute(
        'SELECT * FROM adherents WHERE user_id = ?',
        [userId]
      );
      if (adherents.length > 0) {
        profile.enterprise = adherents[0];
      }
    }

    connection.release();
    res.status(200).json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate confirmation code
function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Send confirmation code to adherent email
exports.sendConfirmationCode = async (req, res) => {
  try {
    const { adherent_id, adherent_email } = req.body;

    if (!adherent_id || !adherent_email) {
      return res.status(400).json({ message: 'adherent_id and adherent_email required' });
    }

    // Verify adherent exists
    const connection = await pool.getConnection();
    const [adherents] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [adherent_id]
    );

    if (adherents.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Adherent not found' });
    }

    // Generate confirmation code
    const code = generateConfirmationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save code in database
    await connection.execute(
      'INSERT INTO confirmation_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [adherent_email, code, expiresAt]
    );

    connection.release();

    // For development: return code in response
    // In production, send via email
    console.log(`📧 Confirmation code for ${adherent_email}: ${code}`);

    res.status(200).json({
      message: 'Confirmation code sent',
      code: code, // Remove in production, use email instead
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('Send confirmation code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register user with confirmation code and update adherent email
exports.registerUserWithConfirmation = async (req, res) => {
  try {
    const { email, password, adherent_id, adherent_email, confirmation_code } = req.body;

    // Validation
    if (!email || !password || !adherent_id || !adherent_email || !confirmation_code) {
      return res.status(400).json({ message: 'Missing required fields: email, password, adherent_id, adherent_email, confirmation_code' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid user email format' });
    }
    if (!emailRegex.test(adherent_email)) {
      return res.status(400).json({ message: 'Invalid adherent email format' });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const connection = await pool.getConnection();

    // Verify confirmation code
    const [codes] = await connection.execute(
      `SELECT * FROM confirmation_codes 
       WHERE email = ? AND code = ? AND is_used = false AND expires_at > NOW()`,
      [adherent_email, confirmation_code]
    );

    if (codes.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid or expired confirmation code' });
    }

    // Check if user email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Verify adherent exists
    const [adherents] = await connection.execute(
      'SELECT id FROM adherents WHERE id = ?',
      [adherent_id]
    );

    if (adherents.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Adherent not found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with adherent_id
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role, adherent_id) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'adherent', adherent_id]
    );

    // Update adherent's email
    await connection.execute(
      'UPDATE adherents SET email = ? WHERE id = ?',
      [adherent_email, adherent_id]
    );

    // Mark confirmation code as used
    await connection.execute(
      'UPDATE confirmation_codes SET is_used = true WHERE email = ? AND code = ?',
      [adherent_email, confirmation_code]
    );

    connection.release();

    console.log(`✅ User registered: ${email} for adherent ${adherent_id} with email ${adherent_email}`);

    res.status(201).json({
      message: 'Account created successfully and adherent email updated',
      userId: userResult.insertId,
      email: email,
      adherent_email: adherent_email
    });

  } catch (error) {
    console.error('Register user with confirmation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password - send reset code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset code
    const code = generateConfirmationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save code in database
    await connection.execute(
      'INSERT INTO confirmation_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );

    connection.release();

    // Send email with reset code
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@amit.com',
      to: email,
      subject: `Réinitialisation de Mot de Passe AMIT - ${code}`,
      html: `
        <h2>Réinitialisation de Mot de Passe</h2>
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>Votre code de réinitialisation est: <strong>${code}</strong></p>
        <p>Ce code expire dans 15 minutes.</p>
        <p>Si vous n'avez pas demandé cela, ignorez ce message.</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ message: 'Error sending reset code', error: error.message });
      }
      res.status(200).json({ message: 'Reset code sent to email' });
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password with code
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const connection = await pool.getConnection();

    // Verify reset code
    const [codes] = await connection.execute(
      `SELECT * FROM confirmation_codes 
       WHERE email = ? AND code = ? AND is_used = false AND expires_at > NOW()`,
      [email, resetCode]
    );

    if (codes.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid or expired reset code' });
    }

    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    // Mark code as used
    await connection.execute(
      'UPDATE confirmation_codes SET is_used = true WHERE email = ? AND code = ?',
      [email, resetCode]
    );

    connection.release();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};