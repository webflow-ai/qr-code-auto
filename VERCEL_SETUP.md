# Quick Vercel Setup Fix

Your app is trying to call localhost:5000 instead of the Vercel API. This is because the environment variable is not set correctly.

## Immediate Fix Steps

### 1. Update Environment Variables in Vercel

Go to: https://vercel.com/your-username/qr-code-auto/settings/environment-variables

**CRITICAL:** Make sure `VITE_API_URL` is set to your Vercel domain, NOT localhost!

#### Frontend Variables (Required for Build):
```
VITE_SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt
VITE_API_URL=https://qr-code-auto.vercel.app
```

**IMPORTANT:** The `VITE_API_URL` must be `https://qr-code-auto.vercel.app` (your Vercel domain), NOT `http://localhost:5000`!

#### Backend/API Variables (Required for Serverless Functions):
```
SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZGhxd2pqa2N6eHJhb29iZXl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5OTEwNywiZXhwIjoyMDg2OTc1MTA3fQ.xMakuoLOayN_bCiit7p2eqmTO7wuZFD8NB_oAvFx5Pw
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

### 2. Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Wait for build to complete

### 3. Check Browser Console

After redeployment, if still blank:
1. Open https://qr-code-auto.vercel.app
2. Press F12 to open Developer Tools
3. Check Console tab for errors
4. Check Network tab for failed requests

## Common Issues

### Issue 1: Build Fails
- Make sure all VITE_ variables are set
- Check build logs in Vercel dashboard

### Issue 2: API Calls Fail
- Verify SUPABASE_SERVICE_ROLE_KEY is correct
- Check Function logs in Vercel dashboard

### Issue 3: Still Blank Screen
- Clear browser cache
- Try incognito/private window
- Check if index.html is being served

## Verify Setup

Test these URLs after deployment:

1. **Frontend:** https://qr-code-auto.vercel.app
   - Should show login page

2. **Health Check:** https://qr-code-auto.vercel.app/api/health
   - Should return JSON with success: true

3. **Test Login:**
   - Go to Supabase dashboard
   - Create a test user in Authentication → Users
   - Try logging in

## Need Help?

Check Vercel logs:
- Go to your project dashboard
- Click on "Deployments"
- Click on the latest deployment
- Check "Build Logs" and "Function Logs"
