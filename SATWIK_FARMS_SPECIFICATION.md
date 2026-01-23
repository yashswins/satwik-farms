# Satwik Farms - Next.js/React Website Specification

## Agent Implementation Contract (read first)
This spec is written for a single-pass build. Do not ask follow-up questions; use the decisions below.

**Decisions locked**
- Framework: Next.js 14 App Router, JavaScript (no TypeScript).
- Directory layout: `satwik-website/` with `src/` (do not use `/app` at repo root).
- Styling: Tailwind CSS + custom CSS in `src/app/globals.css` and `src/styles/farm-glass.css`; no Bootstrap.
- Image handling: Next.js Image component with optimization.
- Animations: Framer Motion for scroll animations and transitions.
- Video: Embedded YouTube player with react-player library.
- QR Codes: Generated with `qrcode.react` library.
- Social Integration: Direct links to Instagram, WhatsApp Group.
- Status tracking: update `satwik-website/PROJECT_STATUS.md` after each phase.

**Acceptance checks**
- `npm run build` succeeds.
- `/`, `/about`, `/farm-visits`, `/ventures` render without runtime errors.
- Homepage slideshow transitions smoothly between farm images.
- All social media links, QR codes, and app download buttons work.
- Theme is vibrant with green and white throughout.
- Frosted navbar scrolls and animates properly.

## Project Overview
Build a modern, visually stunning website for Satwik Farms - a Tanzanian organic farm in Kisarawe. The website will showcase the farm's story, promote farm visits, link to their Android app for product orders, and provide social media integration. Design inspiration from AeroFarms and Bowles Farming with a vibrant green color palette and frosted glass aesthetics.

**Tagline:** "Harvest to home: Freshness delivered"

**About Satwik Farms:**
Discover the taste of Tanzania with Satwik Farms! We bring the bounty of our organically grown produce directly from our farm in Kisarawe to your doorstep. We grow our vegetables organically and have cattle through which we deliver the highest quality milk, yoghurt, ghee, and more. We never compromise on quality - customer satisfaction is of utmost importance to us. We are transparent about everything, which is why we encourage people to come to our farms and experience it themselves.

## Why Next.js/React?
- **Performance:** Sub-1 second page loads with image optimization
- **SEO:** Server-side rendering for Google visibility
- **Image Optimization:** Automatic image compression and lazy loading
- **Scalability:** Easy to add new ventures/pages
- **Modern:** Industry standard for professional websites

## Technology Stack
- **Frontend Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS + Custom CSS (for frosted glass effects)
- **Animations:** Framer Motion
- **Image Slideshow:** Swiper.js or custom with Framer Motion
- **Video Player:** HTML5 video with autoplay
- **QR Codes:** qrcode.react
- **Icons:** React Icons (Feather Icons or Heroicons)
- **Form Handling:** React Hook Form (for contact forms)
- **Deployment:** Vercel (free tier)

## Project Structure
```
satwik-website/
├── package.json
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
│
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── play-store.png
│   │   ├── slideshow/
│   │   │   ├── 1.jpg
│   │   │   ├── 2.jpg
│   │   │   ├── 3.jpg
│   │   │   ├── 4.jpg
│   │   │   ├── 5.jpg
│   │   │   ├── 6.jpg
│   │   │   └── 7.jpg
│   │   ├── farm/
│   │   │   ├── 1.jpg
│   │   │   ├── 2.jpg
│   │   │   ├── 3.jpg
│   │   │   └── 4.jpg
│   │   └── activities/
│   │       ├── 1.jpg
│   │       ├── 2.jpg
│   │       └── 3.jpg
│   └── videos/
│       └── farm-tour.mp4
│
├── src/
│   ├── app/
│   │   ├── layout.js                 # Root layout with fonts, metadata
│   │   ├── page.js                   # Home page
│   │   ├── globals.css               # Global styles + Tailwind
│   │   │
│   │   ├── about/
│   │   │   └── page.js               # About Us page
│   │   │
│   │   ├── farm-visits/
│   │   │   └── page.js               # Farm Visits page
│   │   │
│   │   ├── ventures/
│   │   │   └── page.js               # Other Ventures page (with tabs)
│   │   │
│   │   └── api/
│   │       └── contact/
│   │           └── route.js          # Contact form endpoint
│   │
│   ├── components/
│   │   ├── home/
│   │   │   ├── HeroSlideshow.jsx
│   │   │   ├── AppDownload.jsx
│   │   │   ├── FarmHighlights.jsx
│   │   │   ├── SocialConnect.jsx
│   │   │   └── QuickVisitCTA.jsx
│   │   │
│   │   ├── about/
│   │   │   ├── OurStory.jsx
│   │   │   ├── MissionVision.jsx
│   │   │   └── TeamSection.jsx
│   │   │
│   │   ├── farm-visits/
│   │   │   ├── VisitHero.jsx
│   │   │   ├── ActivitiesGrid.jsx
│   │   │   ├── PricingInfo.jsx
│   │   │   └── BookingForm.jsx
│   │   │
│   │   ├── ventures/
│   │   │   ├── VenturesTabs.jsx
│   │   │   └── VentureCard.jsx
│   │   │
│   │   ├── ui/
│   │   │   ├── GlassCard.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── QRCode.jsx
│   │   │   └── VideoPlayer.jsx
│   │   │
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   │
│   ├── lib/
│   │   └── utils.js                  # Helper functions
│   │
│   └── styles/
│       └── farm-glass.css            # Custom frosted glass effects
│
├── .env.local                         # Environment variables
└── README.md
```

## Color Palette (Vibrant Green Theme)

```css
:root {
  /* Primary Colors - Vibrant Greens */
  --farm-green-primary: #2D5016;      /* Deep forest green */
  --farm-green-bright: #68B030;       /* Bright leaf green */
  --farm-green-light: #98D84E;        /* Light fresh green */
  --farm-green-mint: #C8E6C9;         /* Mint green */

  /* Secondary Colors */
  --farm-white: #FFFFFF;
  --farm-cream: #FAFAF8;
  --farm-earth: #8B7355;              /* Earth brown for accents */

  /* Accent Colors */
  --farm-sunshine: #FFD54F;           /* Warm yellow for highlights */
  --farm-sky: #81C3D7;                /* Light blue for contrast */

  /* Text Colors */
  --text-primary: #1A1A1A;
  --text-secondary: #4A5568;
  --text-light: #718096;

  /* Glass Effects */
  --glass-fill-green: rgba(104, 176, 48, 0.15);
  --glass-fill-white: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(45, 80, 22, 0.15);
  --glass-shadow-hover: 0 16px 48px rgba(45, 80, 22, 0.25);
}
```

## Core Features & Page Structure

### 1. Home Page (`/`)

**A. Hero Slideshow Section**
Full-screen image slideshow with farm imagery:
- Auto-advance every 5 seconds
- Manual navigation with dots and arrows
- Overlay text with farm tagline
- Smooth fade transitions
- Images: farm landscapes, cattle, dairy operations, happy visitors

```jsx
import HeroSlideshow from '@/components/home/HeroSlideshow';
import AppDownload from '@/components/home/AppDownload';
import FarmHighlights from '@/components/home/FarmHighlights';
import SocialConnect from '@/components/home/SocialConnect';
import QuickVisitCTA from '@/components/home/QuickVisitCTA';

export default function Home() {
  return (
    <>
      <HeroSlideshow />
      <FarmHighlights />
      <AppDownload />
      <SocialConnect />
      <QuickVisitCTA />
    </>
  );
}
```

**HeroSlideshow Component (`components/home/HeroSlideshow.jsx`)**
```jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const slides = [
  {
    image: '/images/slideshow/1.jpg',
    title: 'Welcome to Satwik Farms',
    subtitle: 'Harvest to home: Freshness delivered'
  },
  {
    image: '/images/slideshow/2.jpg',
    title: 'Organic Vegetables from Kisarawe',
    subtitle: 'Grown with care, delivered fresh to your doorstep'
  },
  {
    image: '/images/slideshow/3.jpg',
    title: 'Visit Our Farm',
    subtitle: 'Experience transparency and quality first-hand'
  },
  {
    image: '/images/slideshow/4.jpg',
    title: 'Premium Dairy Products',
    subtitle: 'Fresh milk, yoghurt, and ghee from happy cattle'
  },
  {
    image: '/images/slideshow/5.jpg',
    title: 'Fresh from the Farm',
    subtitle: 'Quality you can trust, taste you can savor'
  },
  {
    image: '/images/slideshow/6.jpg',
    title: 'Nature at Its Best',
    subtitle: 'Sustainable farming for a healthier tomorrow'
  },
  {
    image: '/images/slideshow/7.jpg',
    title: 'Experience Farm Life',
    subtitle: 'Visit us and see where your food comes from'
  }
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority={currentSlide === 0}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="glass-card-white max-w-3xl p-12 rounded-3xl">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold text-farm-green-primary mb-6"
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl md:text-3xl text-text-secondary"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'bg-farm-green-bright w-12'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 glass-card-white p-4 rounded-full hover:bg-white/90 transition z-10"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-farm-green-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 glass-card-white p-4 rounded-full hover:bg-white/90 transition z-10"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-farm-green-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
```

**B. Farm Highlights Section**
Showcase key aspects of the farm with images as backgrounds:
- Fresh produce
- Dairy operations
- Sustainable practices
- Happy animals

```jsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const highlights = [
  {
    title: 'Organic Farming',
    description: 'Chemical-free, sustainable practices for healthier produce',
    image: '/images/farm/1.jpg',
    icon: '🌾'
  },
  {
    title: 'Quality Dairy',
    description: 'Fresh milk from happy, ethically-raised cattle',
    image: '/images/farm/2.jpg',
    icon: '🥛'
  },
  {
    title: 'Farm Visits',
    description: 'Experience farm life with activities for all ages',
    image: '/images/farm/3.jpg',
    icon: '🚜'
  },
  {
    title: 'Happy Cattle',
    description: 'Well-cared animals in natural, spacious environment',
    image: '/images/farm/4.jpg',
    icon: '🐄'
  }
];

export default function FarmHighlights() {
  return (
    <section className="py-24 px-6 bg-farm-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-farm-green-primary mb-6">
            What Makes Us Special
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Committed to sustainable farming and connecting people with nature
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-3xl h-96 group"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/90">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**C. App Download Section with QR Code**

```jsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import QRCode from 'qrcode.react';

export default function AppDownload() {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.satwikfarms.satwik';

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/farm/1.jpg"
          alt="Farm background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-farm-green-primary/80" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Order Fresh from Our Farm
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Download our Android app to browse our catalogue and place orders directly from your phone
          </p>
        </motion.div>

        <div className="glass-card-white p-12 rounded-3xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <QRCode
                  value={playStoreUrl}
                  size={240}
                  level="H"
                  includeMargin
                  fgColor="#2D5016"
                />
                <p className="text-center mt-4 font-semibold text-farm-green-primary text-lg">
                  Scan to Download
                </p>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-farm-green-primary mb-6">
                Get Started Today
              </h3>
              <p className="text-text-secondary mb-6">
                Browse our fresh organic vegetables, premium dairy products (milk, yoghurt, ghee), and place orders for home delivery to Dar es Salaam or farm pickup in Kisarawe.
              </p>
              <p className="text-text-secondary mb-8">
                Experience the taste of Tanzania with produce grown organically and delivered fresh from our farm.
              </p>
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src="/images/play-store.png"
                  alt="Get it on Google Play"
                  width={200}
                  height={60}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**D. Social Connect Section with Farm Video**

```jsx
'use client';

import { motion } from 'framer-motion';
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

export default function SocialConnect() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-farm-green-primary mb-6">
            Stay Connected
          </h2>
          <p className="text-xl text-text-secondary">
            Follow our journey and join our community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Farm Tour Video */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-3xl"
          >
            <h3 className="text-2xl font-bold text-farm-green-primary mb-4">
              Experience Our Farm
            </h3>
            <div className="relative rounded-2xl overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/videos/farm-tour.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            {/* Instagram */}
            <a
              href="https://www.instagram.com/satwik.farms/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-4 rounded-2xl">
                  <FaInstagram className="text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-farm-green-primary mb-1">
                    Follow us on Instagram
                  </h3>
                  <p className="text-text-secondary">
                    @satwik.farms - Daily updates and farm life
                  </p>
                </div>
              </div>
            </a>

            {/* WhatsApp Group */}
            <a
              href="https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-4 rounded-2xl">
                  <FaWhatsapp className="text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-farm-green-primary mb-1">
                    Join our WhatsApp Group
                  </h3>
                  <p className="text-text-secondary">
                    Browse catalogue, place orders, and get exclusive offers
                  </p>
                </div>
              </div>
            </a>

            {/* Google Maps */}
            <a
              href="https://share.google/Pmtmn6QtK6gez9ExY"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-500 p-4 rounded-2xl">
                  <FaMapMarkerAlt className="text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-farm-green-primary mb-1">
                    Visit Us in Kisarawe
                  </h3>
                  <p className="text-text-secondary">
                    Get directions to our farm
                  </p>
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### 2. About Us Page (`/about`)

**Our Story Section**
```jsx
import OurStory from '@/components/about/OurStory';
import MissionVision from '@/components/about/MissionVision';

export default function AboutPage() {
  return (
    <div className="pt-20">
      <OurStory />
      <MissionVision />
    </div>
  );
}
```

**OurStory Component:**
```jsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OurStory() {
  return (
    <section className="py-24 px-6 bg-farm-cream">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-farm-green-primary mb-6">
            Our Story
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Bringing the bounty of organic farming from Kisarawe to your doorstep
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src="/images/farm/1.jpg"
              alt="Satwik Farms fields"
              width={600}
              height={400}
              className="rounded-3xl shadow-lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-farm-green-primary mb-6">
              Discover the taste of Tanzania
            </h2>
            <p className="text-lg text-text-secondary mb-4">
              Satwik Farms brings the bounty of our organically grown produce directly from our farm in Kisarawe to your doorstep. Experience the vibrant flavors and exceptional quality that only comes from fresh, carefully nurtured ingredients.
            </p>
            <p className="text-lg text-text-secondary mb-4">
              We grow our vegetables organically and have cattle through which we deliver the highest quality milk, yoghurt, ghee, and more. We never compromise on quality - customer satisfaction is of utmost importance to us.
            </p>
            <p className="text-lg text-text-secondary">
              We are transparent about everything, which is why we encourage people to come to our farms and experience it themselves. Taste the difference with Satwik Farms and elevate your meals with nature's best.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

**MissionVision Component:**
```jsx
'use client';

import { motion } from 'framer-motion';

export default function MissionVision() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-green p-12 rounded-3xl"
          >
            <div className="text-5xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-farm-green-primary mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-text-secondary">
              To deliver the freshest, highest-quality organic produce and dairy products from our farm to your table, while maintaining complete transparency in our farming practices and building lasting relationships with our community through trust and exceptional customer service.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card-green p-12 rounded-3xl"
          >
            <div className="text-5xl mb-6">🌟</div>
            <h2 className="text-3xl font-bold text-farm-green-primary mb-6">
              Our Vision
            </h2>
            <p className="text-lg text-text-secondary">
              To become Tanzania's most trusted source of organic produce and premium dairy products, setting the standard for sustainable farming practices, quality assurance, and customer satisfaction while nurturing a healthier, more connected community.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold text-farm-green-primary text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card-white p-8 rounded-3xl text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-farm-green-primary mb-3">
                Quality First
              </h3>
              <p className="text-text-secondary">
                We never compromise on quality - from seed to harvest to delivery
              </p>
            </div>
            <div className="glass-card-white p-8 rounded-3xl text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-farm-green-primary mb-3">
                Transparency
              </h3>
              <p className="text-text-secondary">
                Open doors, open books - experience our farm firsthand
              </p>
            </div>
            <div className="glass-card-white p-8 rounded-3xl text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-farm-green-primary mb-3">
                Customer Satisfaction
              </h3>
              <p className="text-text-secondary">
                Your happiness and health are our top priorities
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

### 3. Farm Visits Page (`/farm-visits`)

**Activities Offered:**
- Nature walks and farm tours
- Mud bath experience
- Tree planting activities
- Cattle interaction and feeding
- Learn about farming and dairy production
- Tea, breakfast, snacks, refreshments, lunch

**Pricing Information:**
- Entry fees
- Group discounts
- Meal packages

```jsx
import VisitHero from '@/components/farm-visits/VisitHero';
import ActivitiesGrid from '@/components/farm-visits/ActivitiesGrid';
import PricingInfo from '@/components/farm-visits/PricingInfo';
import BookingForm from '@/components/farm-visits/BookingForm';

export default function FarmVisitsPage() {
  return (
    <div className="pt-20">
      <VisitHero />
      <ActivitiesGrid />
      <PricingInfo />
      <BookingForm />
    </div>
  );
}
```

**Activities Grid Component:**
```jsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const activities = [
  {
    title: 'Farm Tours',
    description: 'Guided tours of our fields, dairy, and facilities',
    icon: '🚜',
    image: '/images/activities/1.jpg'
  },
  {
    title: 'Nature Walks & Experiences',
    description: 'Peaceful walks through our green landscapes and farm activities',
    icon: '🌳',
    image: '/images/activities/2.jpg'
  },
  {
    title: 'Meet the Farm',
    description: 'Interact with cattle, plant trees, enjoy mud baths, and fresh farm meals',
    icon: '🐄',
    image: '/images/activities/3.jpg'
  }
];

export default function ActivitiesGrid() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-farm-green-primary mb-6">
            Activities & Experiences
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            A day at Satwik Farms is filled with learning, fun, and connection with nature
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-64">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-6xl">
                  {activity.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-farm-green-primary mb-2">
                  {activity.title}
                </h3>
                <p className="text-text-secondary">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 4. Ventures Page (`/ventures`)

Tabbed interface for different ventures:
- Farm Visits (main)
- Organic Produce
- Dairy Products
- Educational Programs
- Corporate Events
- Future ventures

```jsx
'use client';

import { useState } from 'react';
import VenturesTabs from '@/components/ventures/VenturesTabs';
import VentureCard from '@/components/ventures/VentureCard';

export default function VenturesPage() {
  return (
    <div className="pt-20">
      <VenturesTabs />
    </div>
  );
}
```

## Reusable UI Components

### Frosted Navbar
```jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-card-white shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Satwik Farms"
            width={50}
            height={50}
          />
          <span className="text-2xl font-bold text-farm-green-primary">
            Satwik Farms
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/about"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            About Us
          </Link>
          <Link
            href="/farm-visits"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            Farm Visits
          </Link>
          <Link
            href="/ventures"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            Our Ventures
          </Link>
          <Link
            href="/#app-download"
            className="btn-primary px-6 py-3 rounded-full"
          >
            Download App
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-farm-green-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-card-white px-6 pb-4 space-y-4"
        >
          <Link href="/about" className="block text-text-primary hover:text-farm-green-bright">
            About Us
          </Link>
          <Link href="/farm-visits" className="block text-text-primary hover:text-farm-green-bright">
            Farm Visits
          </Link>
          <Link href="/ventures" className="block text-text-primary hover:text-farm-green-bright">
            Our Ventures
          </Link>
          <Link href="/#app-download" className="block btn-primary px-6 py-3 rounded-full text-center">
            Download App
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
```

### Glass Card Component
```jsx
export default function GlassCard({ children, className = '', variant = 'white' }) {
  const variants = {
    white: 'glass-card-white',
    green: 'glass-card-green'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
```

### Button Component
```jsx
import Link from 'next/link';

export default function Button({ children, href, onClick, variant = 'primary', className = '' }) {
  const baseClasses = 'px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-block text-center';

  const variants = {
    primary: 'bg-farm-green-bright text-white hover:bg-farm-green-primary shadow-lg hover:shadow-xl hover:-translate-y-1',
    secondary: 'bg-white text-farm-green-primary border-2 border-farm-green-bright hover:bg-farm-green-light/20 hover:-translate-y-1',
    outline: 'bg-transparent text-white border-2 border-white hover:bg-white/10'
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
```

### Footer Component
```jsx
import Link from 'next/link';
import { FaInstagram, FaWhatsapp, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-farm-green-primary text-white py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-bold mb-4">Satwik Farms</h3>
          <p className="text-white/80 mb-4">
            Harvest to home: Freshness delivered
          </p>
          <p className="text-white/80 text-sm">
            Organic vegetables and premium dairy from Kisarawe, Tanzania
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link href="/farm-visits" className="hover:text-white transition">Farm Visits</Link></li>
            <li><Link href="/ventures" className="hover:text-white transition">Our Ventures</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-lg">Contact Us</h4>
          <div className="space-y-3 text-white/80">
            <a href="tel:+255767211422" className="flex items-center gap-2 hover:text-white transition">
              <FaPhone className="text-farm-green-light" />
              <span>+255 767 211 422</span>
            </a>
            <a href="https://share.google/Pmtmn6QtK6gez9ExY" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition">
              <FaMapMarkerAlt className="text-farm-green-light" />
              <span>Kisarawe, Tanzania</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-lg">Follow Us</h4>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/satwik.farms/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"
              aria-label="Instagram"
            >
              <FaInstagram className="text-2xl" />
            </a>
            <a
              href="https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="text-2xl" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/20 text-center text-white/60">
        © {new Date().getFullYear()} Satwik Farms. All rights reserved.
      </div>
    </footer>
  );
}
```

### Video Component (HTML5 with Autoplay)
```jsx
export default function FarmVideo({ src, className = '' }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
```

## Package.json

```json
{
  "name": "satwik-farms-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.3",
    "qrcode.react": "^3.1.0",
    "react-icons": "^5.0.1",
    "react-hook-form": "^7.49.3"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

## Next.js Configuration

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
```

## Tailwind Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'farm-green-primary': '#2D5016',
        'farm-green-bright': '#68B030',
        'farm-green-light': '#98D84E',
        'farm-green-mint': '#C8E6C9',
        'farm-white': '#FFFFFF',
        'farm-cream': '#FAFAF8',
        'farm-earth': '#8B7355',
        'farm-sunshine': '#FFD54F',
        'farm-sky': '#81C3D7',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A5568',
        'text-light': '#718096',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
};
```

## Environment Variables (.env.local)

```bash
# App Download Link
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.satwikfarms.satwik

# Social Media
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/satwik.farms/
NEXT_PUBLIC_WHATSAPP_GROUP=https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM
NEXT_PUBLIC_GOOGLE_MAPS=https://share.google/Pmtmn6QtK6gez9ExY

# Contact
NEXT_PUBLIC_PHONE=+255 767 211 422

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Development Workflow

### Setup
```bash
# Create project directory
mkdir satwik-website
cd satwik-website

# Initialize Next.js
npx create-next-app@latest . --js --no-typescript --tailwind --app --no-src-dir

# Move to src directory structure
mkdir -p src
mv app src/
mv components src/
mv styles src/

# Install dependencies
npm install framer-motion qrcode.react react-icons react-hook-form

# Run development server
npm run dev
```

### Development Phases

**Phase 1: Foundation (Week 1)**
1. Set up Next.js project structure
2. Configure Tailwind + custom farm-glass.css
3. Create color palette and design tokens
4. Build reusable UI components
5. Create Navbar and Footer

**Phase 2: Home Page (Week 1-2)**
6. Build hero slideshow
7. Create farm highlights section
8. Implement app download section with QR codes
9. Add social connect section with video player
10. Add animations with Framer Motion

**Phase 3: Content Pages (Week 2)**
11. Build About Us page
12. Create Farm Visits page with activities
13. Implement Ventures page with tabs
14. Add all images and content

**Phase 4: Polish & Deploy (Week 2-3)**
15. Test all animations and transitions
16. Optimize images
17. Add SEO metadata
18. Test responsive design
19. Deploy to Vercel
