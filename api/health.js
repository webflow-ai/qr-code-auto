module.exports = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Vehicle QR Verification API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.VERCEL_ENV || 'development',
  });
};
