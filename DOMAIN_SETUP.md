# 🌐 Domain Setup Guide - satwikfarms.com

## Step 1: Deploy to Vercel First

Before connecting your domain, deploy the site to Vercel:

1. Go to [vercel.com](https://vercel.com/signup)
2. Sign up with your GitHub account
3. Click **"New Project"**
4. Import `yashswins/satwik-farms` repository
5. Click **"Deploy"** (takes 2-3 minutes)
6. Note your Vercel URL: `https://satwik-farms-xxx.vercel.app`

---

## Step 2: Add Domain to Vercel

### In Vercel Dashboard:

1. Go to your project: `satwik-farms`
2. Click **Settings** (top navigation)
3. Click **Domains** (left sidebar)
4. In the input field, enter: `satwikfarms.com`
5. Click **Add**
6. Also add: `www.satwikfarms.com`
7. Click **Add**

Vercel will show you DNS configuration instructions.

---

## Step 3: Configure DNS Records

### Where did you buy the domain?

#### Option A: Namecheap, GoDaddy, or Other Registrar

1. Log in to your domain registrar
2. Go to **DNS Management** or **DNS Settings**
3. Add the following records:

**For Root Domain (satwikfarms.com):**

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| A | @ | `76.76.21.21` | Automatic |

**For WWW Subdomain (www.satwikfarms.com):**

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| CNAME | www | `cname.vercel-dns.com` | Automatic |

#### Option B: Vercel Nameservers (Recommended for Best Performance)

Instead of individual DNS records, point your nameservers to Vercel:

1. In your domain registrar, go to **Nameservers** settings
2. Change from default nameservers to Vercel's:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Save changes

**Advantages:**
- Faster propagation
- Automatic SSL certificate renewal
- Better performance with Vercel Edge Network
- Easier management (no manual DNS records)

---

## Step 4: Wait for DNS Propagation

DNS changes take time to propagate:
- **Typical**: 15 minutes to 2 hours
- **Maximum**: Up to 48 hours

**Check propagation status:**
- Use [dnschecker.org](https://dnschecker.org/)
- Enter: `satwikfarms.com`
- Type: `A` record
- Should show: `76.76.21.21`

---

## Step 5: Verify in Vercel

1. Go back to Vercel → Your Project → Domains
2. You should see:
   - `satwikfarms.com` ✅ Valid Configuration
   - `www.satwikfarms.com` ✅ Valid Configuration

3. Vercel will automatically:
   - Issue SSL certificate (HTTPS)
   - Redirect www to non-www (or vice versa)
   - Configure CDN

---

## Step 6: Test Your Domain

Once DNS propagates, test your site:

```bash
# Check if domain resolves
ping satwikfarms.com

# Test HTTPS
curl -I https://satwikfarms.com
```

**Or visit in browser:**
- https://satwikfarms.com ✅
- https://www.satwikfarms.com ✅ (should redirect to main)
- http://satwikfarms.com ✅ (should redirect to HTTPS)

---

## Step 7: Update Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add new property: `https://satwikfarms.com`
3. Verify ownership (already configured in code)
4. Submit sitemap: `https://satwikfarms.com/sitemap.xml`

---

## Troubleshooting

### Issue: Domain not connecting after 24 hours

**Check DNS configuration:**
```bash
# Check A record
nslookup satwikfarms.com

# Should return: 76.76.21.21
```

**Fix:**
1. Verify DNS records are correct in your registrar
2. Clear DNS cache locally:
   ```bash
   ipconfig /flushdns  # Windows
   ```
3. Check for typos in DNS records

### Issue: SSL Certificate Error

**Wait for certificate issuance:**
- Vercel automatically issues SSL certificates
- Takes 5-15 minutes after DNS propagates
- Check status in Vercel → Domains

**If still failing:**
1. Remove domain from Vercel
2. Wait 5 minutes
3. Re-add domain

### Issue: Site shows Vercel 404 page

**Possible causes:**
1. Deployment failed - Check Vercel → Deployments
2. DNS not propagated yet - Wait longer
3. Wrong domain in Vercel - Double check spelling

---

## Additional Configuration (Optional)

### Email Forwarding

If you want `contact@satwikfarms.com`:

1. In your domain registrar, look for **Email Forwarding**
2. Add:
   - From: `contact@satwikfarms.com`
   - To: Your actual email

### Subdomain (e.g., blog.satwikfarms.com)

1. In Vercel → Domains, add: `blog.satwikfarms.com`
2. In DNS, add CNAME:
   - Type: `CNAME`
   - Name: `blog`
   - Value: `cname.vercel-dns.com`

---

## Quick Reference Card

### DNS Records Needed

```
Type: A
Host: @
Value: 76.76.21.21

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

### Vercel Project Settings

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Important URLs

- Vercel Dashboard: https://vercel.com/dashboard
- Your GitHub Repo: https://github.com/yashswins/satwik-farms
- DNS Checker: https://dnschecker.org/
- Google Search Console: https://search.google.com/search-console

---

## ✅ Success Checklist

Once everything is set up:

- [ ] Domain resolves to Vercel (check with `ping satwikfarms.com`)
- [ ] HTTPS is working (green padlock in browser)
- [ ] All pages load correctly
- [ ] WhatsApp QR codes work
- [ ] Video plays in fullscreen
- [ ] Forms submit successfully
- [ ] Mobile site is responsive
- [ ] SSL certificate is valid (check at ssllabs.com)
- [ ] Google Search Console verified
- [ ] Sitemap submitted to Google

---

## 🎉 Your Domain is Live!

Once connected, your website will be available at:
- **https://satwikfarms.com** (primary)
- **https://www.satwikfarms.com** (redirects to primary)

All Vercel deployments will automatically deploy to this domain! 🚀
