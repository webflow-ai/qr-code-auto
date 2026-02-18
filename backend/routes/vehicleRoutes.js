const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
    createVehicle,
    listVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
    verifyVehicle,
} = require('../controllers/vehicleController');

const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    next();
};

// ─── Validation Rules ───────────────────────────────────────────────────────

const createVehicleValidation = [
    body('registration_number')
        .trim()
        .notEmpty().withMessage('Registration number is required')
        .isLength({ max: 20 }).withMessage('Registration number too long'),
    body('owner_name')
        .trim()
        .notEmpty().withMessage('Owner name is required')
        .isLength({ max: 100 }).withMessage('Owner name too long'),
    body('owner_aadhaar')
        .notEmpty().withMessage('Owner Aadhaar is required')
        .matches(/^\d{12}$/).withMessage('Owner Aadhaar must be exactly 12 digits'),
    body('owner_mobile')
        .optional()
        .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),
    body('chassis_number')
        .optional()
        .trim()
        .isLength({ max: 50 }),
    body('registration_date')
        .optional()
        .isDate().withMessage('Invalid registration date'),
    body('driver_name')
        .optional()
        .trim()
        .isLength({ max: 100 }),
    body('driver_aadhaar')
        .optional()
        .matches(/^\d{12}$/).withMessage('Driver Aadhaar must be exactly 12 digits'),
    body('driver_mobile')
        .optional()
        .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),
    body('driving_license_number')
        .optional()
        .trim()
        .isLength({ max: 20 }),
    body('status')
        .optional()
        .isIn(['active', 'expired', 'revoked']).withMessage('Status must be active, expired, or revoked'),
];

const updateVehicleValidation = [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
    body('registration_number').optional().trim().isLength({ max: 20 }),
    body('owner_name').optional().trim().isLength({ max: 100 }),
    body('owner_aadhaar').optional().matches(/^\d{12}$/).withMessage('Aadhaar must be 12 digits'),
    body('owner_mobile').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
    body('driver_aadhaar').optional().matches(/^\d{12}$/).withMessage('Aadhaar must be 12 digits'),
    body('driver_mobile').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
    body('status').optional().isIn(['active', 'expired', 'revoked']),
];

// ─── Protected Admin Routes ──────────────────────────────────────────────────

// POST /api/vehicles — Create vehicle record
router.post('/', authMiddleware, createVehicleValidation, validate, createVehicle);

// GET /api/vehicles — List all vehicles (with search & pagination)
router.get('/', authMiddleware, listVehicles);

// GET /api/vehicles/:id — Get single vehicle
router.get('/:id', authMiddleware, [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
    validate,
], getVehicle);

// PUT /api/vehicles/:id — Update vehicle
router.put('/:id', authMiddleware, updateVehicleValidation, validate, updateVehicle);

// DELETE /api/vehicles/:id — Soft delete (revoke)
router.delete('/:id', authMiddleware, [
    param('id').isUUID().withMessage('Invalid vehicle ID'),
    validate,
], deleteVehicle);

module.exports = router;
