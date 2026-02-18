# Fix Vercel Deployment - CORS & API Issues

## Problem
Your app is trying to call `http://localhost:5000` from the production site, causing CORS errors.

## Solution

### Step 1: Update Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: `qr-code-auto`
3. Go to Settings → Environment Variables
4. **Delete** the old `VITE_API_URL` if it's set to localhost
5. Add/Update these variables for **Production** environment:

```
VITE_SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt
```

**DO NOT SET** `VITE_API_URL` - the app will automatically use the same origin (qr-code-auto.vercel.app)

6. Add these for the API functions:

```
SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZGhxd2pqa2N6eHJhb29iZXl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5OTEwNywiZXhwIjoyMDg2OTc1MTA3fQ.xMakuoLOayN_bCiit7p2eqmTO7wuZFD8NB_oAvFx5Pw
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

### Step 2: Push Updated Code

```bash
git add .
git commit -m "Fix CORS and API URL configuration"
git push
```

Vercel will automatically redeploy.

### Step 3: Verify Deployment

After deployment completes (2-3 minutes):

1. **Test Health Check:**
   - Visit: https://qr-code-auto.vercel.app/api/health
   - Should return: `{"success":true,"message":"Smart Vehicle QR Verification API is running",...}`

2. **Test Frontend:**
   - Visit: https://qr-code-auto.vercel.app
   - Should show the login page (not blank)
   - Open browser console (F12) and check for errors
   - Should see: `API URL: https://qr-code-auto.vercel.app`

3. **Test Login:**
   - Create a user in Supabase dashboard (Authentication → Users)
   - Try logging in
   - Should redirect to dashboard

### Step 4: Troubleshooting

If still having issues:

**Check Browser Console:**
```
F12 → Console tab
Look for: "API URL: https://qr-code-auto.vercel.app"
If it shows localhost, environment variables weren't applied
```

**Check Network Tab:**
```
F12 → Network tab
Try to login or load dashboard
Check if API calls go to qr-code-auto.vercel.app or localhost
```

**Check Vercel Logs:**
```
Vercel Dashboard → Your Project → Deployments → Latest → View Function Logs
Look for errors in the API functions
```

**Common Issues:**

1. **Still calling localhost:**
   - Environment variables not set correctly
   - Need to redeploy after setting variables
   - Clear browser cache

2. **404 on API calls:**
   - API functions not deployed
   - Check that `api/` folder exists in deployment
   - Check vercel.json routing configuration

3. **500 errors:**
   - Check Function Logs in Vercel
   - Verify SUPABASE_SERVICE_ROLE_KEY is correct
   - Verify ENCRYPTION_KEY is set

## What Changed

1. **CORS Headers:** Updated to allow all origins with proper preflight handling
2. **API URL Logic:** Frontend now automatically uses same origin in production
3. **Environment Variables:** Simplified - no need to set VITE_API_URL in production
4. **Error Handling:** Better logging for debugging

## Expected Behavior

- **Development (localhost:5173):** Calls `http://localhost:5000`
- **Production (qr-code-auto.vercel.app):** Calls `https://qr-code-auto.vercel.app/api/*`

## Need More Help?

1. Check the browser console for the "API URL" log
2. Share the error messages from browser console
3. Check Vercel Function Logs for backend errors
