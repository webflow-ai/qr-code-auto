const { createClient } = require('@supabase/supabase-js');
const { decrypt, maskAadhaar } = require('./_utils/encryption');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// CORS headers - allow all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Vehicle ID is required' });
    }

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

    return res.status(200).json({
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
  } catch (error) {
    console.error('[VERIFY] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
