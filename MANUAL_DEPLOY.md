# Manual Deployment to Vercel

Since auto-deploy is not working, here are multiple ways to deploy manually.

## Option 1: Redeploy from Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Click on your project: **qr-code-auto**
3. Go to the **Deployments** tab
4. Find the latest deployment
5. Click the **three dots (...)** menu on the right
6. Click **Redeploy**
7. Confirm the redeployment

This will rebuild and redeploy your app with the latest code from GitHub.

---

## Option 2: Trigger Deployment via Git

Sometimes Vercel doesn't detect changes. Force a new deployment:

```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

Wait 2-3 minutes and check Vercel dashboard for new deployment.

---

## Option 3: Install Vercel CLI and Deploy

### Install Vercel CLI:
```bash
npm install -g vercel
```

### Login to Vercel:
```bash
vercel login
```

### Deploy:
```bash
# From project root
vercel --prod
```

This will deploy directly from your local machine.

---

## Option 4: Check Git Integration

If auto-deploy still doesn't work, check Git integration:

1. Go to: https://vercel.com/dashboard
2. Click on your project: **qr-code-auto**
3. Go to **Settings** → **Git**
4. Check if your repository is connected
5. If not connected:
   - Click **Connect Git Repository**
   - Select your repository
   - Configure branch (usually `main`)

---

## Option 5: Reconnect Repository

If Git integration exists but not working:

1. Go to **Settings** → **Git**
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select your repository again
5. Choose branch: `main`
6. Save

This will trigger a new deployment.

---

## Verify Deployment

After deployment (any method):

### 1. Check Deployment Status
- Go to Vercel Dashboard → Deployments
- Latest deployment should show "Ready" status
- Click on it to see build logs

### 2. Test API Health
Visit: https://qr-code-auto.vercel.app/api/health

Should return:
```json
{
  "success": true,
  "message": "Smart Vehicle QR Verification API is running",
  "timestamp": "...",
  "version": "1.0.0",
  "environment": "production"
}
```

### 3. Test Frontend
Visit: https://qr-code-auto.vercel.app

Should show:
- Login page (not blank screen)
- No console errors
- Console log: "API URL: https://qr-code-auto.vercel.app"

### 4. Test Login
- Create user in Supabase (Authentication → Users)
- Try logging in
- Should redirect to dashboard

---

## Troubleshooting

### Build Fails
Check build logs in Vercel:
1. Go to Deployments
2. Click on failed deployment
3. Check "Build Logs" tab
4. Look for errors

Common issues:
- Missing environment variables
- npm install failures
- Build command errors

### Deployment Succeeds but App Doesn't Work
1. Check Function Logs (for API errors)
2. Check browser console (F12)
3. Verify environment variables are set
4. Check Network tab for failed requests

### Auto-Deploy Not Working
Possible causes:
1. Git integration not configured
2. Branch mismatch (deploying from wrong branch)
3. Vercel app not connected to repository
4. GitHub/GitLab permissions issue

Fix:
- Reconnect repository (Option 5 above)
- Check branch settings
- Verify repository permissions

---

## Quick Deploy Now

Run this command to force a deployment:

```bash
git commit --allow-empty -m "Force Vercel deployment"
git push origin main
```

Then go to Vercel dashboard and click **Redeploy** on the latest deployment.

---

## Environment Variables Checklist

Make sure these are set in Vercel (Settings → Environment Variables):

### Frontend (for build):
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ❌ `VITE_API_URL` (should NOT be set, or set to https://qr-code-auto.vercel.app)

### Backend (for API functions):
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `ENCRYPTION_KEY`

All should be set for **Production** environment.

---

## Need Help?

If deployment still fails:
1. Share the build logs from Vercel
2. Share any error messages
3. Check if repository is properly connected
