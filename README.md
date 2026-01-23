# Satwik Farms Website

Official website for Satwik Farms - an organic farm in Kisarawe, Tanzania, delivering fresh vegetables and premium dairy products.

## 🌾 Features

- **Hero Slideshow**: Auto-advancing slideshow with 7 farm images
- **WhatsApp Integration**: Primary ordering platform with QR code
- **Android App**: Download links and QR codes for mobile app
- **Farm Visits**: Book guided tours and farm activities
- **Blog Section**: Latest updates and user-contributed stories
- **Fullscreen Video**: Interactive farm tour video
- **SEO Optimized**: Comprehensive metadata, sitemap, and structured data
- **Performance**: Next.js Image Optimization, lazy loading, and caching

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Frosted Glass Design
- **Animations**: Framer Motion
- **Icons**: React Icons
- **QR Codes**: qrcode.react
- **Forms**: React Hook Form
- **Deployment**: Vercel

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment on Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (if any)
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## 🔧 Environment Variables

Create `.env.local` for development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_URL=https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.satwikfarms.satwik
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/satwik.farms/
NEXT_PUBLIC_GOOGLE_MAPS_URL=https://share.google/Pmtmn6QtK6gez9ExY
NEXT_PUBLIC_PHONE=+255767211422
```

## 📊 SEO Features

- ✅ Comprehensive meta tags and Open Graph
- ✅ Structured data (JSON-LD) for LocalBusiness
- ✅ XML Sitemap (`/sitemap.xml`)
- ✅ Robots.txt for crawler directives
- ✅ Page-specific metadata
- ✅ Image optimization with Next.js
- ✅ Semantic HTML structure
- ✅ Mobile-first responsive design

## 🎨 Color Palette

- Primary Green: `#2D5016`
- Bright Green: `#68B030`
- Light Green: `#98D84E`
- Mint Green: `#C8E6C9`
- Cream: `#FFF8E1`

## 📁 Project Structure

```
satwik-website/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── blog/              # Blog pages
│   ├── farm-visits/       # Farm visits page
│   ├── ventures/          # Ventures page
│   ├── layout.js          # Root layout with metadata
│   └── page.js            # Homepage
├── components/            # React components
│   ├── home/             # Homepage components
│   ├── about/            # About page components
│   ├── farm-visits/      # Farm visits components
│   ├── ventures/         # Ventures components
│   ├── layout/           # Layout components (Navbar, Footer)
│   └── ui/               # UI components (WhatsApp button)
├── public/               # Static assets
│   ├── images/          # Images (slideshow, farm, activities)
│   ├── videos/          # Videos (farm tour)
│   ├── robots.txt       # Crawler directives
│   └── sitemap.xml      # XML sitemap
├── styles/              # Global styles
│   └── farm-glass.css   # Frosted glass effects
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vercel.json          # Vercel deployment config
```

## 📝 Custom Domain Setup on Vercel

1. Go to your project on Vercel
2. Navigate to **Settings** → **Domains**
3. Add your custom domain (e.g., `satwikfarms.com`)
4. Follow DNS configuration instructions
5. Update `metadataBase` in `app/layout.js` to your domain

## 🔍 Google Search Console Setup

1. Verify your site at [Google Search Console](https://search.google.com/search-console)
2. Add the verification code to `metadata.verification.google` in `app/layout.js`
3. Submit your sitemap: `https://satwikfarms.com/sitemap.xml`
4. Monitor indexing and search performance

## 📱 Contact

- **Phone**: +255 767 211 422
- **WhatsApp**: [Join our group](https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM)
- **Instagram**: [@satwik.farms](https://www.instagram.com/satwik.farms/)
- **Location**: Kisarawe, Tanzania

## 📄 License

© 2026 Satwik Farms. All rights reserved.

---

**Harvest to home: Freshness delivered** 🌱
