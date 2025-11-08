# ⚠️ CRITICAL: Vercel Deployment Checklist

## You MUST do these steps for the app to work on Vercel:

### 1. Add MongoDB URI to Vercel Environment Variables

Go to: https://vercel.com/dashboard

1. Click on your project: **turf-tan.vercel.app**
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add this variable:

```
Name: MONGODB_URI

Value: mongodb+srv://ramanrathore031204_db_user:Raman%40mongodb00@turfbooking.e4wg2op.mongodb.net/turfbooking?retryWrites=true&w=majority&appName=TurfBooking

Environment: Production, Preview, Development (select all 3)
```

5. Click **Save**

### 2. Redeploy Your App

After adding the environment variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**

OR just wait for the automatic deployment to complete (triggered by your git push).

### 3. Verify MongoDB Atlas Network Access

1. Go to: https://cloud.mongodb.com
2. Navigate to: **Security → Network Access**
3. Make sure you have: **0.0.0.0/0** (Allow access from anywhere)
4. If not, click **Add IP Address** → **Allow Access from Anywhere**

### 4. Test Your Deployment

Once deployed, test these URLs:

1. **Health Check:**
   ```
   https://turf-tan.vercel.app/api/health
   ```
   Should return: `{ "status": "healthy", "database": "connected" }`

2. **Main App:**
   ```
   https://turf-tan.vercel.app
   ```
   Should show the landing page with the video playing

3. **Try Registration:**
   - Click "Register"
   - Fill in details
   - Submit
   - Should work without timeout errors

## Changes Made:

✅ **Video File:**
- Renamed from: `WhatsApp Video 2025-10-18 at 08.58.54_6412ec40.mp4`
- To: `turf-hero.mp4` (no spaces, cleaner)
- Updated in: `index.html`
- Configured in: `vercel.json`

✅ **MongoDB Connection:**
- Environment-aware settings (local vs production)
- Better connection caching for serverless
- Proper timeout handling
- Auto-reconnect middleware

✅ **Git Configuration:**
- Updated `.gitignore` to allow `turf-hero.mp4`
- Excluded other video formats

## Common Issues:

### Video not showing:
- **Cause:** Browser cache
- **Solution:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Database timeout errors:
- **Cause:** MONGODB_URI not set in Vercel
- **Solution:** Add environment variable (Step 1 above)

### 503 Service Unavailable:
- **Cause:** MongoDB Atlas blocking Vercel IPs
- **Solution:** Add 0.0.0.0/0 to Network Access (Step 3 above)

## Deployment Status:

Your code is pushed to GitHub. Vercel will automatically deploy.

Check deployment status: https://vercel.com/dashboard

**IMPORTANT:** The app WILL NOT work until you complete Step 1 (Add MONGODB_URI)!
