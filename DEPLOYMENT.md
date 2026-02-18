# Deployment Guide - Vercel

This guide will help you deploy the Smart Vehicle & Driver QR Verification System to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Supabase project with the database set up (run `supabase_setup.sql`)
3. Git repository with your code

## Step 1: Prepare Your Repository

Make sure all files are committed to your Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration from `vercel.json`

## Step 3: Configure Environment Variables

In the Vercel dashboard, go to your project settings → Environment Variables and add:

### Backend Environment Variables (for API functions)

```
SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

### Frontend Environment Variables (for build)

```
VITE_SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt
VITE_API_URL=https://your-app.vercel.app
```

**Important:** 
- Set all variables for "Production", "Preview", and "Development" environments
- After deployment, update `VITE_API_URL` with your actual Vercel URL
- The `PUBLIC_APP_URL` is automatically set by Vercel

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be live at `https://your-app.vercel.app`

## Step 5: Update Frontend API URL

After first deployment:

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to Environment Variables in Vercel
3. Update `VITE_API_URL` to your deployment URL
4. Redeploy the project

## Step 6: Create Admin User

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to Authentication → Users
3. Click "Add user"
4. Enter email and password
5. Check "Auto Confirm User"
6. Save

## Step 7: Test Your Deployment

1. Visit `https://your-app.vercel.app`
2. Login with your admin credentials
3. Create a test vehicle record
4. Scan the QR code or visit the verify URL
5. Confirm the public verification page works

## API Endpoints

Your deployed API will be available at:

- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles` - List vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Revoke vehicle
- `GET /api/verify/:id` - Public verification (no auth)

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Ensure `frontend/package.json` has all required dependencies
- Check build logs in Vercel dashboard

### API Functions Not Working

- Verify environment variables are set for all environments
- Check function logs in Vercel dashboard
- Ensure Supabase credentials are correct

### CORS Issues

- The API functions include CORS headers for all origins
- If issues persist, check browser console for specific errors

### QR Codes Not Generating

- Ensure `PUBLIC_APP_URL` or `VERCEL_URL` is set correctly
- Check that the `qrcode` package is installed

## Local Development

To run locally after setting up for Vercel:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run both servers
npm run dev
```

## Notes

- Vercel serverless functions have a 10-second timeout (configurable in `vercel.json`)
- The free tier has limits on function invocations and bandwidth
- Consider upgrading to Pro for production use
- All Aadhaar data is encrypted with AES-256 before storage
- The service role key should NEVER be exposed to the frontend

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Check Supabase documentation: https://supabase.com/docs
- Review application logs in Vercel dashboard
