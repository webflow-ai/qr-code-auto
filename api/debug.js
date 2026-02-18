// Debug endpoint to check environment variables
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const envCheck = {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set ✓' : 'Missing ✗',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✓' : 'Missing ✗',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? 'Set ✓' : 'Missing ✗',
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'Set ✓' : 'Missing ✗',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗',
    NODE_ENV: process.env.NODE_ENV || 'Not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'Not set',
    VERCEL_URL: process.env.VERCEL_URL || 'Not set',
  };

  const allSet = Object.entries(envCheck)
    .filter(([key]) => key.includes('SUPABASE') || key.includes('ENCRYPTION'))
    .every(([, value]) => value.includes('✓'));

  return res.status(200).json({
    success: allSet,
    message: allSet ? 'All required environment variables are set' : 'Some environment variables are missing',
    environment: envCheck,
    instructions: allSet ? null : 'Go to Vercel Dashboard → Settings → Environment Variables and add the missing variables, then redeploy.'
  });
};
