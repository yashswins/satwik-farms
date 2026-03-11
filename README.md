# Satwik Farms — Marketing Website

> Official website for Satwik Farms, a residue-free farm in Kisarawe, Tanzania delivering fresh vegetables and premium dairy to Dar es Salaam.

**Live:** [satwikfarms.com](https://satwikfarms.com)

---

## What it does

The site serves as the primary digital presence for the business — introducing the farm, showcasing products, driving WhatsApp orders, and promoting the Android app. It also handles farm visit bookings and publishes blog content.

**Pages:** Home, About, Farm Visits, Our Ventures, Gallery, Blog, FAQ

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS, custom frosted-glass CSS |
| Animations | Framer Motion |
| Blog | React Markdown + remark-gfm (`.md` files in `/blogs`) |
| QR codes | qrcode.react |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel |

## Architecture

```
app/                        # Next.js App Router
├── page.js                 # Homepage
├── about/
├── blog/                   # Dynamic routes from /blogs/*.md
├── farm-visits/
├── gallery/
│   └── api/gallery/        # Route handler: returns gallery image list
├── ventures/
├── faq/
├── sitemap.js              # Auto-generated XML sitemap
└── layout.js               # Root layout + global metadata

components/
├── home/                   # Hero, slideshow, product sections, CTA
├── about/
├── farm-visits/
├── ventures/
├── layout/                 # Navbar, Footer
└── ui/                     # WhatsApp button, shared primitives

blogs/                      # Markdown content files
public/
├── images/                 # Farm photos, product images
└── videos/                 # Farm tour video
```

### Key Features

- Auto-rotating image slideshow with Framer Motion transitions
- Fullscreen video tour
- WhatsApp ordering integration (primary sales channel)
- Android app download with QR code
- Farm visit booking section
- Markdown-powered blog
- SEO: JSON-LD `LocalBusiness` structured data, XML sitemap, Open Graph, per-page metadata

## Running Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Key environment variables: `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_PLAY_STORE_URL`, `NEXT_PUBLIC_SITE_URL`.
