const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const initDatabase = require('./db/init');

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    console.log('✅ Database initialized successfully!');

    const app = express();

    // Middleware
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Routes
    app.use('/api/visites', require('./routes/visites'));
    app.use('/api/formations', require('./routes/formations'));
    app.use('/api/sensibilisations', require('./routes/sensibilisations'));

    // Admin routes
    app.use('/api/admin', require('./routes/admin'));

    // NEW V2 API with 3 roles
    app.use('/api/v2', require('./routes/api'));

    // Health check
    app.get('/api/health', (req, res) => {
      res.status(200).json({ message: 'Server is running' });
    });

    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Error Handler
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    });

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    
    // Keep process running
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();
