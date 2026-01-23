# 🚀 Deployment Guide for Satwik Farms Website

## Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

If you haven't already pushed your code:

```bash
cd c:\Users\yashs\Documents\python\satwik-website
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Import Git Repository"**
5. Choose `yashswins/satwik-farms`
6. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
7. Click **"Deploy"**

Your site will be live at: `https://satwik-farms-xxx.vercel.app`

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Domains**
3. Enter your domain: `satwikfarms.com`
4. Click **Add**

### Step 2: Configure DNS

Vercel will provide DNS records. Add these to your domain registrar:

**For root domain (satwikfarms.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Step 3: Update Configuration

After domain is verified, update in `app/layout.js`:

```javascript
export const metadata = {
  metadataBase: new URL('https://satwikfarms.com'),
  // ... rest of metadata
};
```

Commit and push:
```bash
git add app/layout.js
git commit -m "Update domain to satwikfarms.com"
git push
```

Vercel will auto-deploy the changes.

---

## 🔍 Google Search Console Setup

### Step 1: Verify Ownership

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add Property**
3. Enter: `https://satwikfarms.com`
4. Choose **HTML tag** verification method
5. Copy the verification code (looks like: `google-site-verification=xxxxx`)

### Step 2: Add Verification to Website

Update `app/layout.js`:

```javascript
export const metadata = {
  // ... other metadata
  verification: {
    google: 'paste-your-verification-code-here',
  },
};
```

Commit and deploy:
```bash
git add app/layout.js
git commit -m "Add Google Search Console verification"
git push
```

### Step 3: Submit Sitemap

1. Wait for deployment (2-3 minutes)
2. Go back to Google Search Console
3. Click **Verify**
4. Navigate to **Sitemaps** (left sidebar)
5. Add sitemap URL: `https://satwikfarms.com/sitemap.xml`
6. Click **Submit**

---

## 📊 Performance Optimization Checklist

### ✅ Already Configured

- [x] Next.js Image Optimization (WebP/AVIF)
- [x] Lazy loading for images
- [x] Code splitting and dynamic imports
- [x] Cache headers for static assets
- [x] Compression (handled by Vercel)
- [x] CDN distribution (Vercel Edge Network)

### 🔧 Additional Optimizations

#### 1. Compress Images

Your slideshow images are large (up to 18MB). Compress them:

```bash
# Using online tools:
- TinyPNG: https://tinypng.com/
- ImageOptim: https://imageoptim.com/

# Target size: < 500KB per image
# Recommended resolution: 1920x1080 pixels
# Quality: 80-85%
```

Replace in `public/images/slideshow/` and commit:
```bash
git add public/images/slideshow/
git commit -m "Optimize slideshow images for web"
git push
```

#### 2. Enable Analytics

**Vercel Analytics** (Free):
1. Go to your project on Vercel
2. Navigate to **Analytics** tab
3. Click **Enable Analytics**

**Google Analytics** (Optional):
1. Get tracking ID from [Google Analytics](https://analytics.google.com/)
2. Add to `app/layout.js`:

```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `
        }} />
        {/* Existing structured data */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: Build Fails on Vercel

**Check build logs:**
1. Go to Vercel dashboard → Deployments
2. Click on failed deployment
3. Read build logs

**Common fixes:**
```bash
# Clear cache and rebuild locally
rm -rf .next node_modules
npm install
npm run build

# If successful, commit lock file
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue: Images Not Loading

**Verify paths:**
- Images should be in `public/` folder
- Reference without `/public` prefix
- Example: `/images/logo.png` (not `/public/images/logo.png`)

### Issue: Environment Variables

**Add in Vercel dashboard:**
1. Settings → Environment Variables
2. Add each variable
3. Redeploy the project

---

## 🎯 Post-Deployment Checklist

### Immediate (Day 1)

- [ ] Verify site is live and accessible
- [ ] Test all page navigation
- [ ] Check WhatsApp QR codes scan correctly
- [ ] Test Android app download link
- [ ] Verify video plays and fullscreen works
- [ ] Test form submissions
- [ ] Check mobile responsiveness

### Week 1

- [ ] Monitor Vercel Analytics
- [ ] Check Google Search Console for indexing
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test page load speeds on [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Fix any Core Web Vitals issues

### Month 1

- [ ] Review analytics and traffic sources
- [ ] Optimize underperforming pages
- [ ] Add new blog posts
- [ ] Update testimonials if needed
- [ ] Gather user feedback

---

## 📞 Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Check build logs on Vercel dashboard

---

## 🎉 Your Site is Live!

Once deployed, your website will be accessible at:
- **Vercel URL**: `https://satwik-farms-xxx.vercel.app`
- **Custom Domain** (after setup): `https://satwikfarms.com`

Share it with your customers! 🌾
