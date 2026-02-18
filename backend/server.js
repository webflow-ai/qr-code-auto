require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const vehicleRoutes = require('./routes/vehicleRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ─────────────────────────────────────────────────────

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — only allow frontend origin
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Rate limiting — general
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for write operations
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { success: false, error: 'Too many write requests, please try again later.' },
});

app.use(generalLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Vehicle QR Verification API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

// Admin routes (protected)
app.use('/api/vehicles', writeLimiter, vehicleRoutes);

// Public verification route
app.use('/api/verify', verifyRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`\n🚀 Smart Vehicle QR Verification API`);
    console.log(`   Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
