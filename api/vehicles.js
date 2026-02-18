const { createClient } = require('@supabase/supabase-js');
const { encrypt, decrypt, maskAadhaar } = require('./_utils/encryption');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';

// Check for required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}) : null;

// CORS headers - allow all origins for now
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

module.exports = async (req, res) => {
  // Set CORS headers first
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    const { id } = query;

    // Check if Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error. Please check environment variables.' 
      });
    }

    // GET /api/vehicles - List all vehicles
    if (method === 'GET' && !id) {
      const { page = 1, limit = 10, search = '', status } = query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let supabaseQuery = supabase
        .from('vehicles')
        .select('id, registration_number, owner_name, owner_mobile, chassis_number, registration_date, driver_name, driver_mobile, driving_license_number, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (search) {
        supabaseQuery = supabaseQuery.or(`registration_number.ilike.%${search}%,owner_name.ilike.%${search}%,chassis_number.ilike.%${search}%`);
      }

      if (status) {
        supabaseQuery = supabaseQuery.eq('status', status);
      }

      const { data, error, count } = await supabaseQuery;

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      });
    }

    // GET /api/vehicles/:id - Get single vehicle
    if (method === 'GET' && id) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, error: 'Vehicle record not found' });
      }

      const ownerAadhaarDecrypted = decrypt(data.owner_aadhaar_encrypted);
      const driverAadhaarDecrypted = decrypt(data.driver_aadhaar_encrypted);

      const verifyUrl = `${PUBLIC_APP_URL}/verify/${id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      });

      return res.status(200).json({
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
    }

    // POST /api/vehicles - Create vehicle
    if (method === 'POST') {
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
      } = body;

      const owner_aadhaar_encrypted = owner_aadhaar ? encrypt(owner_aadhaar) : null;
      const driver_aadhaar_encrypted = driver_aadhaar ? encrypt(driver_aadhaar) : null;

      const vehicleId = uuidv4();

      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          id: vehicleId,
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
        return res.status(500).json({ success: false, error: error.message });
      }

      const verifyUrl = `${PUBLIC_APP_URL}/verify/${vehicleId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      });

      supabase.from('audit_logs').insert([{
        action: 'CREATE',
        vehicle_id: vehicleId,
        performed_by: 'system',
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
    }

    // PUT /api/vehicles/:id - Update vehicle
    if (method === 'PUT' && id) {
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
      } = body;

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

      supabase.from('audit_logs').insert([{
        action: 'UPDATE',
        vehicle_id: id,
        performed_by: 'system',
        details: `Vehicle ${data.registration_number} updated`,
      }]);

      return res.status(200).json({
        success: true,
        message: 'Vehicle record updated successfully',
        data: {
          ...data,
          owner_aadhaar_encrypted: undefined,
          driver_aadhaar_encrypted: undefined,
        },
      });
    }

    // DELETE /api/vehicles/:id - Soft delete
    if (method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ status: 'revoked' })
        .eq('id', id)
        .select('registration_number')
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, error: 'Vehicle not found' });
      }

      supabase.from('audit_logs').insert([{
        action: 'DELETE',
        vehicle_id: id,
        performed_by: 'system',
        details: `Vehicle ${data.registration_number} revoked`,
      }]);

      return res.status(200).json({
        success: true,
        message: 'Vehicle record revoked successfully',
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
