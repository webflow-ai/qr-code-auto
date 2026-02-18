const supabase = require('../supabaseClient');
const { encrypt, decrypt, maskAadhaar } = require('../utils/encryption');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || 'http://localhost:5173';

/**
 * POST /api/vehicles
 * Create a new vehicle record (Admin only)
 */
async function createVehicle(req, res, next) {
    try {
        const {
            registration_number,
            owner_name,
            owner_aadhaar,
            owner_mobile,
            chassis_number,
            registration_date,
            driver_name,
            driver_aadhaar,
            driver_mobile,
            driving_license_number,
            status = 'active',
        } = req.body;

        // Encrypt sensitive Aadhaar data
        const owner_aadhaar_encrypted = owner_aadhaar ? encrypt(owner_aadhaar) : null;
        const driver_aadhaar_encrypted = driver_aadhaar ? encrypt(driver_aadhaar) : null;

        const id = uuidv4();

        const { data, error } = await supabase
            .from('vehicles')
            .insert([{
                id,
                registration_number: registration_number.trim().toUpperCase(),
                owner_name: owner_name.trim(),
                owner_aadhaar_encrypted,
                owner_mobile: owner_mobile?.trim(),
                chassis_number: chassis_number?.trim().toUpperCase(),
                registration_date,
                driver_name: driver_name?.trim(),
                driver_aadhaar_encrypted,
                driver_mobile: driver_mobile?.trim(),
                driving_license_number: driving_license_number?.trim().toUpperCase(),
                status,
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Generate QR code
        const verifyUrl = `${PUBLIC_APP_URL}/verify/${id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300,
            color: { dark: '#1a1a2e', light: '#ffffff' },
        });

        // Log audit (non-blocking)
        supabase.from('audit_logs').insert([{
            action: 'CREATE',
            vehicle_id: id,
            performed_by: req.user?.id || 'system',
            details: `Vehicle ${registration_number} created`,
        }]);

        return res.status(201).json({
            success: true,
            message: 'Vehicle record created successfully',
            data: {
                ...data,
                owner_aadhaar_encrypted: undefined,
                driver_aadhaar_encrypted: undefined,
                owner_aadhaar_masked: maskAadhaar(owner_aadhaar),
                driver_aadhaar_masked: maskAadhaar(driver_aadhaar),
            },
            qrCode: qrCodeDataUrl,
            verifyUrl,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/vehicles
 * List all vehicles with search and pagination (Admin only)
 */
async function listVehicles(req, res, next) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('vehicles')
            .select('id, registration_number, owner_name, owner_mobile, chassis_number, registration_date, driver_name, driver_mobile, driving_license_number, status, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (search) {
            query = query.or(`registration_number.ilike.%${search}%,owner_name.ilike.%${search}%,chassis_number.ilike.%${search}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.json({
            success: true,
            data,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/vehicles/:id
 * Get a single vehicle record (Admin only)
 */
async function getVehicle(req, res, next) {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, error: 'Vehicle record not found' });
        }

        // Decrypt Aadhaar for admin view (masked)
        const ownerAadhaarDecrypted = decrypt(data.owner_aadhaar_encrypted);
        const driverAadhaarDecrypted = decrypt(data.driver_aadhaar_encrypted);

        // Generate QR code
        const verifyUrl = `${PUBLIC_APP_URL}/verify/${id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300,
            color: { dark: '#1a1a2e', light: '#ffffff' },
        });

        return res.json({
            success: true,
            data: {
                ...data,
                owner_aadhaar_encrypted: undefined,
                driver_aadhaar_encrypted: undefined,
                owner_aadhaar_masked: maskAadhaar(ownerAadhaarDecrypted),
                driver_aadhaar_masked: maskAadhaar(driverAadhaarDecrypted),
            },
            qrCode: qrCodeDataUrl,
            verifyUrl,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/vehicles/:id
 * Update a vehicle record (Admin only)
 */
async function updateVehicle(req, res, next) {
    try {
        const { id } = req.params;
        const {
            registration_number,
            owner_name,
            owner_aadhaar,
            owner_mobile,
            chassis_number,
            registration_date,
            driver_name,
            driver_aadhaar,
            driver_mobile,
            driving_license_number,
            status,
        } = req.body;

        const updateData = {};
        if (registration_number) updateData.registration_number = registration_number.trim().toUpperCase();
        if (owner_name) updateData.owner_name = owner_name.trim();
        if (owner_aadhaar) updateData.owner_aadhaar_encrypted = encrypt(owner_aadhaar);
        if (owner_mobile !== undefined) updateData.owner_mobile = owner_mobile?.trim();
        if (chassis_number !== undefined) updateData.chassis_number = chassis_number?.trim().toUpperCase();
        if (registration_date !== undefined) updateData.registration_date = registration_date;
        if (driver_name !== undefined) updateData.driver_name = driver_name?.trim();
        if (driver_aadhaar) updateData.driver_aadhaar_encrypted = encrypt(driver_aadhaar);
        if (driver_mobile !== undefined) updateData.driver_mobile = driver_mobile?.trim();
        if (driving_license_number !== undefined) updateData.driving_license_number = driving_license_number?.trim().toUpperCase();
        if (status) updateData.status = status;

        const { data, error } = await supabase
            .from('vehicles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, error: error?.message || 'Vehicle not found' });
        }

        // Audit log (non-blocking)
        supabase.from('audit_logs').insert([{
            action: 'UPDATE',
            vehicle_id: id,
            performed_by: req.user?.id || 'system',
            details: `Vehicle ${data.registration_number} updated`,
        }]);

        return res.json({
            success: true,
            message: 'Vehicle record updated successfully',
            data: {
                ...data,
                owner_aadhaar_encrypted: undefined,
                driver_aadhaar_encrypted: undefined,
            },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /api/vehicles/:id
 * Soft delete (revoke) a vehicle record (Admin only)
 */
async function deleteVehicle(req, res, next) {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('vehicles')
            .update({ status: 'revoked' })
            .eq('id', id)
            .select('registration_number')
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }

        // Audit log (non-blocking)
        supabase.from('audit_logs').insert([{
            action: 'DELETE',
            vehicle_id: id,
            performed_by: req.user?.id || 'system',
            details: `Vehicle ${data.registration_number} revoked`,
        }]);

        return res.json({
            success: true,
            message: 'Vehicle record revoked successfully',
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/verify/:id
 * Public verification endpoint — no auth required
 */
async function verifyVehicle(req, res, next) {
    try {
        const { id } = req.params;

        console.log('[VERIFY] Request for vehicle ID:', id);

        const { data, error } = await supabase
            .from('vehicles')
            .select('id, registration_number, owner_name, owner_aadhaar_encrypted, owner_mobile, chassis_number, registration_date, driver_name, driver_aadhaar_encrypted, driver_mobile, driving_license_number, status, created_at')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.log('[VERIFY] Vehicle not found:', error?.message);
            return res.status(404).json({ success: false, error: 'Vehicle record not found' });
        }

        console.log('[VERIFY] Vehicle found:', data.registration_number);

        // Decrypt and mask Aadhaar for public display
        const ownerAadhaarDecrypted = decrypt(data.owner_aadhaar_encrypted);
        const driverAadhaarDecrypted = decrypt(data.driver_aadhaar_encrypted);

        console.log('[VERIFY] Decryption complete, sending response');

        return res.json({
            success: true,
            data: {
                id: data.id,
                registration_number: data.registration_number,
                owner_name: data.owner_name,
                owner_aadhaar_masked: maskAadhaar(ownerAadhaarDecrypted),
                owner_mobile: data.owner_mobile,
                chassis_number: data.chassis_number,
                registration_date: data.registration_date,
                driver_name: data.driver_name,
                driver_aadhaar_masked: maskAadhaar(driverAadhaarDecrypted),
                driver_mobile: data.driver_mobile,
                driving_license_number: data.driving_license_number,
                status: data.status,
                created_at: data.created_at,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createVehicle,
    listVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
    verifyVehicle,
};
