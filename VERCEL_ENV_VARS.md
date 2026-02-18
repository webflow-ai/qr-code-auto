# Vercel Environment Variables - Quick Reference

## ⚠️ CRITICAL: Your app is calling localhost instead of Vercel API

This happens when `VITE_API_URL` is set incorrectly or the build didn't pick up the right variables.

---

## Step-by-Step Fix

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard → Select "qr-code-auto" → Settings → Environment Variables

### 2. Check Current Variables

Look for these variables and their values:

| Variable | Current Value | Should Be |
|----------|--------------|-----------|
| `VITE_API_URL` | ❌ `http://localhost:5000` | ✅ **DELETE THIS** |
| `VITE_SUPABASE_URL` | ? | ✅ `https://endhqwjjkczxraoobeyy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ? | ✅ `sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt` |

### 3. Fix the Variables

**DELETE** `VITE_API_URL` if it exists (click the three dots → Delete)

**ADD/UPDATE** these for **Production** environment:

```
VITE_SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_z_AgUDYqZFFdV0jkRYk4uQ_BhV-JlNt
```

**ADD** these for API functions (Production):

```
SUPABASE_URL=https://endhqwjjkczxraoobeyy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZGhxd2pqa2N6eHJhb29iZXl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5OTEwNywiZXhwIjoyMDg2OTc1MTA3fQ.xMakuoLOayN_bCiit7p2eqmTO7wuZFD8NB_oAvFx5Pw
ENCRYPTION_KEY=your-32-character-encryption-key!!
```

### 4. Redeploy

After updating variables:
1. Go to **Deployments** tab
2. Click three dots (...) on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

### 5. Verify

After redeployment:
1. Open https://qr-code-auto.vercel.app
2. Press F12 (Developer Tools)
3. Check Console tab
4. Should see: `API URL: https://qr-code-auto.vercel.app`
5. Should NOT see: `API URL: http://localhost:5000`

---

## Why This Happens

The frontend is built with environment variables baked in. If `VITE_API_URL` is set to localhost during build, it will always call localhost.

**Solution:** Don't set `VITE_API_URL` in production. The app automatically uses the same origin.

---

## Complete Environment Variables List

### Frontend (for Vite build):
- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- ❌ `VITE_API_URL` - **DO NOT SET** (or set to `https://qr-code-auto.vercel.app`)

### Backend (for API functions):
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret!)
- ✅ `ENCRYPTION_KEY` - 32-character encryption key

---

## Quick Test

After redeployment, test:

1. **Health Check:**
   ```
   https://qr-code-auto.vercel.app/api/health
   ```
   Should return JSON with `success: true`

2. **Frontend:**
   ```
   https://qr-code-auto.vercel.app
   ```
   Should show login page

3. **Console Log:**
   Open browser console, should see:
   ```
   API URL: https://qr-code-auto.vercel.app
   ```

---

## Still Not Working?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Try incognito/private window
3. Check Vercel build logs for errors
4. Verify all environment variables are set for "Production"
5. Make sure you clicked "Redeploy" after changing variables

---

## Screenshot Guide

When setting environment variables in Vercel:

1. **Name:** `VITE_SUPABASE_URL`
2. **Value:** `https://endhqwjjkczxraoobeyy.supabase.co`
3. **Environment:** Check ✅ Production
4. Click "Save"

Repeat for each variable.

After saving all variables, MUST redeploy!
