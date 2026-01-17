const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Generate 6-digit confirmation code
const generateConfirmationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send confirmation code via email to enterprise
exports.sendConfirmationCode = async (req, res) => {
  try {
    const { email, raison_sociale } = req.body; // email = emailEntreprise

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const connection = await pool.getConnection();

    // Generate confirmation code
    const code = generateConfirmationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code in database (tied to enterprise email)
    await connection.execute(
      'INSERT INTO confirmation_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );

    connection.release();

    // Send email with code to enterprise email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@amit.com',
      to: email,
      subject: `Code de Confirmation AMIT - ${code}`,
      html: `
        <h2>Bienvenue chez AMIT!</h2>
        <p>Votre code de confirmation est: <strong>${code}</strong></p>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Entreprise: ${raison_sociale}</p>
        <p>Si vous n'avez pas demandé cet enregistrement, ignorez ce message.</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ message: 'Error sending confirmation code', error: error.message });
      }
      res.status(200).json({ message: 'Confirmation code sent to email' });
    });

  } catch (error) {
    console.error('Send confirmation code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register with confirmation code
exports.registerAdherentConfirmed = async (req, res) => {
  try {
    const { email, password, raison_sociale, siege, contact, telephone, dispensaire_id, confirmationCode } = req.body;

    // Validation
    if (!email || !password || !raison_sociale || !contact || !telephone || !dispensaire_id || !confirmationCode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!emailRegex.test(contact)) {
      return res.status(400).json({ message: 'Invalid enterprise email format' });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const connection = await pool.getConnection();

    // Verify confirmation code - check against enterprise email (contact)
    const [codes] = await connection.execute(
      `SELECT * FROM confirmation_codes 
       WHERE email = ? AND code = ? AND is_used = false AND expires_at > NOW()`,
      [contact, confirmationCode]  // Verify code on enterprise email
    );

    if (codes.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid or expired confirmation code' });
    }

    // Check if user email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]  // Check user email
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Verify centre exists
    const [centres] = await connection.execute(
      'SELECT id FROM centres WHERE id = ?',
      [dispensaire_id]
    );

    if (centres.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid centre' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'adherent']
    );

    // Create adherent
    await connection.execute(
      `INSERT INTO adherents (raison_sociale, siege, contact, email, user_id, dispensaire_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [raison_sociale, siege || null, contact, telephone, userResult.insertId, dispensaire_id]
    );

    // Mark code as used
    await connection.execute(
      'UPDATE confirmation_codes SET is_used = true WHERE email = ? AND code = ?',
      [contact, confirmationCode]  // Mark code used on enterprise email
    );

    connection.release();

    res.status(201).json({ message: 'Account created successfully', userId: userResult.insertId });
  } catch (error) {
    console.error('Register with code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register - UNIQUEMENT pour adhérants
// ⚠️ BLOCAGE STRICTE : aucun autre rôle ne peut être créé via inscription
exports.registerAdherent = async (req, res) => {
  try {
    const { email, password, raison_sociale, siege, contact, dispensaire_id } = req.body;

    // Validation
    if (!email || !password || !raison_sociale || !contact || !dispensaire_id) {
      return res.status(400).json({ message: 'Missing required fields' });
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

    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Verify centre exists
    const [centres] = await connection.execute(
      'SELECT id FROM centres WHERE id = ?',
      [dispensaire_id]
    );

    if (centres.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid centre' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - ALWAYS 'adherent' role, NO EXCEPTIONS
    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'adherent']
    );

    // Create enterprise
    await connection.execute(
      'INSERT INTO adherents (raison_sociale, siege, contact, email, user_id, dispensaire_id) VALUES (?, ?, ?, ?, ?, ?)',
      [raison_sociale.trim(), siege ? siege.trim() : null, contact.trim(), email, userResult.insertId, dispensaire_id]
    );

    connection.release();

    console.log(`✅ New adherent registered: ${email}`);

    res.status(201).json({
      message: 'Account created successfully. Please log in.',
      userId: userResult.insertId,
    });
  } catch (error) {
    console.error('Register error:', error);
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
      const [adherents] = await connection.execute(
        'SELECT id, raison_sociale FROM adherents WHERE user_id = ?',
        [user.id]
      );
      if (adherents.length > 0) {
        additionalData.adherentId = adherents[0].id;
        additionalData.entreprise = adherents[0].raison_sociale;
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