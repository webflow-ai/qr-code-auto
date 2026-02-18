const express = require('express');
const { param, validationResult } = require('express-validator');
const { verifyVehicle } = require('../controllers/vehicleController');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    next();
};

// GET /api/verify/:id — Public verification (no auth required)
router.get('/:id', [
    param('id').isUUID().withMessage('Invalid verification ID'),
    validate,
], verifyVehicle);

module.exports = router;
