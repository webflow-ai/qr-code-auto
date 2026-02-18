const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * Middleware to verify Supabase JWT token from Authorization header.
 * Protects admin-only routes.
 */
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No token provided',
            });
        }

        const token = authHeader.split(' ')[1];

        // Create a client with the anon key to verify the user token
        const supabaseAuth = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid or expired token',
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: Token verification failed',
        });
    }
}

module.exports = { authMiddleware };
