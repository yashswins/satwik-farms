# Redirect Fix for Google Search Console

## What Was Fixed

Fixed redirect errors for:
- `http://www.satwikfarms.com/` → `https://satwikfarms.com/`
- `https://www.satwikfarms.com/` → `https://satwikfarms.com/`

## Changes Made

### 1. Updated `middleware.js`
Created Edge Middleware to handle redirects at the edge level:
- Redirects all `www` traffic to non-www
- Redirects all HTTP traffic to HTTPS
- Uses 301 (permanent) redirects for SEO

### 2. Updated `next.config.js`
Added comprehensive redirect rules:
- www → non-www redirect
- HTTP → HTTPS redirect

### 3. Updated `vercel.json`
Enhanced redirect configuration with explicit status codes

## Required Vercel Dashboard Configuration

**IMPORTANT:** You must also configure these settings in your Vercel dashboard:

### Step 1: Set Canonical Domain
1. Go to your project on Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Find `satwikfarms.com` and click the three dots (⋯)
4. Select **"Set as Primary Domain"** or **"Edit"**
5. Ensure `satwikfarms.com` (without www) is the primary domain

### Step 2: Configure www Redirect
1. In **Settings** → **Domains**
2. Find `www.satwikfarms.com`
3. Click the three dots (⋯)
4. Select **"Edit"**
5. Under "Redirect to:", select `satwikfarms.com`
6. Ensure "Permanent (301)" is selected
7. Save changes

### Step 3: Force HTTPS (Should be default)
1. In **Settings** → **Domains**
2. Verify that "Force HTTPS" is enabled for all domains
3. This is usually enabled by default on Vercel

## Verification Steps

After deploying these changes:

### 1. Test Redirects Locally
```bash
# Test www redirect
curl -I https://www.satwikfarms.com/

# Test HTTP redirect
curl -I http://satwikfarms.com/
```

Both should return `301 Moved Permanently` with `Location: https://satwikfarms.com/`

### 2. Test in Browser
- Visit `http://www.satwikfarms.com/` - should redirect to `https://satwikfarms.com/`
- Visit `https://www.satwikfarms.com/` - should redirect to `https://satwikfarms.com/`
- Visit `http://satwikfarms.com/` - should redirect to `https://satwikfarms.com/`

### 3. Google Search Console
After deployment and Vercel configuration:
1. Wait 24-48 hours for Google to re-crawl
2. Go to Google Search Console
3. Check the "Coverage" or "Pages" report
4. The redirect errors should resolve

### 4. Request Re-indexing
1. In Google Search Console, go to URL Inspection
2. Enter `https://satwikfarms.com/`
3. Click "Request Indexing"
4. Do the same for a few important pages

## Expected Behavior

### ✅ Correct Redirects
- `http://www.satwikfarms.com/` → `https://satwikfarms.com/` (301)
- `https://www.satwikfarms.com/` → `https://satwikfarms.com/` (301)
- `http://satwikfarms.com/` → `https://satwikfarms.com/` (301)
- `https://satwikfarms.com/` → ✅ (200 OK - canonical URL)

### 📊 SEO Benefits
- Single canonical URL prevents duplicate content issues
- Proper 301 redirects preserve SEO value
- HTTPS improves search rankings
- Better user trust with secure connections

## Troubleshooting

If redirects still don't work after deployment:

1. **Clear Vercel Cache**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Click "Redeploy" with "Use existing Build Cache" UNCHECKED

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Check "Functions" logs for any errors

3. **Verify DNS Settings**
   - Ensure both `satwikfarms.com` and `www.satwikfarms.com` point to Vercel
   - Check DNS propagation at https://dnschecker.org

4. **Contact Vercel Support**
   - If issues persist, reach out to Vercel support with:
     - Project name
     - Domain configuration
     - Expected vs actual behavior

## Timeline

- **Immediate**: Redirects work after deployment
- **24-48 hours**: Google Search Console updates
- **1-2 weeks**: Full indexing update in search results

---

Last updated: February 15, 2026
