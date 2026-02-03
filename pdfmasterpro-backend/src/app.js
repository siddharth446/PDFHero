// Load env variables FIRST before other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const routes = require('./routes');
const path = require('path');

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', routes);

// Serve static files (if any, e.g., for simple download test)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1)); - In production with PM2, we might want to just log
    // But for now let's just log and keep running if possible, or fail gracefully
    console.error('Unhandled Rejection at:', promise, 'reason:', err);
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    console.error('Uncaught Exception:', err);
    process.exit(1); // PM2 will restart it
});

module.exports = app;

// Config updated - Restart Trigger
