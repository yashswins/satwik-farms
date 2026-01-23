# Satwik Farms - Design System & Frosted Glass Reference

## Design Philosophy

Satwik Farms website embodies the harmony between modern design and natural agriculture. The design draws inspiration from:
- **AeroFarms**: Clean, modern layouts with bold imagery
- **Bowles Farming**: Earth-toned color schemes with sustainability focus
- **Apple Design**: Frosted glass aesthetics, smooth animations, premium feel

The goal is to create a vibrant, inviting digital experience that reflects the freshness and vitality of farm life while maintaining professional credibility.

---

## Color System

### Primary Palette - Vibrant Greens

```css
/* Deep Forest Green - Primary brand color */
--farm-green-primary: #2D5016;
/* Use for: Main headings, navbar text, primary CTAs background (dark mode) */

/* Bright Leaf Green - Main accent color */
--farm-green-bright: #68B030;
/* Use for: Primary buttons, links, highlights, active states */

/* Light Fresh Green - Secondary accent */
--farm-green-light: #98D84E;
/* Use for: Hover states, subtle backgrounds, illustrations */

/* Mint Green - Soft accent */
--farm-green-mint: #C8E6C9;
/* Use for: Light backgrounds, borders, subtle highlights */
```

### Neutral Palette

```css
/* Pure White */
--farm-white: #FFFFFF;
/* Use for: Cards, text on dark backgrounds, clean sections */

/* Cream - Soft background */
--farm-cream: #FAFAF8;
/* Use for: Page backgrounds, alternating sections */

/* Earth Brown - Tertiary accent */
--farm-earth: #8B7355;
/* Use for: Secondary text, subtle accents, borders */
```

### Accent Colors

```css
/* Sunshine Yellow */
--farm-sunshine: #FFD54F;
/* Use for: Special highlights, awards, featured badges */

/* Sky Blue - Contrast accent */
--farm-sky: #81C3D7;
/* Use for: Links, secondary CTAs, water/sky imagery overlays */
```

### Text Colors

```css
/* Primary Text */
--text-primary: #1A1A1A;
/* Use for: Body text, main content */

/* Secondary Text */
--text-secondary: #4A5568;
/* Use for: Subtitles, descriptions, secondary information */

/* Light Text */
--text-light: #718096;
/* Use for: Captions, metadata, tertiary information */
```

---

## Frosted Glass Effects

### Implementation

The frosted glass aesthetic creates depth and modern elegance while maintaining readability.

```css
/* src/styles/farm-glass.css */

:root {
  /* Glass Fill Colors */
  --glass-fill-green: rgba(104, 176, 48, 0.15);
  --glass-fill-white: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.3);

  /* Shadows */
  --glass-shadow: 0 8px 32px rgba(45, 80, 22, 0.15);
  --glass-shadow-hover: 0 16px 48px rgba(45, 80, 22, 0.25);

  /* Border Radius */
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 30px;
  --radius-pill: 999px;
}

/* White Glass Card - For content on colored backgrounds */
.glass-card-white {
  background: var(--glass-fill-white);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-white:hover {
  box-shadow: var(--glass-shadow-hover);
  transform: translateY(-4px);
}

/* Green Glass Card - For cards on white backgrounds */
.glass-card-green {
  background: var(--glass-fill-green);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(104, 176, 48, 0.2);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card-green:hover {
  background: rgba(104, 176, 48, 0.25);
  box-shadow: var(--glass-shadow-hover);
  transform: translateY(-4px);
}

/* Glass Input Fields */
.glass-input {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(45, 80, 22, 0.15);
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--farm-green-bright);
  outline: none;
  box-shadow: 0 0 0 3px rgba(104, 176, 48, 0.1);
}

/* Glass Navbar */
.glass-navbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* Glass Button (Secondary) */
.glass-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 32px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}
```

### Usage Guidelines

**When to use White Glass Cards:**
- Content overlays on photo backgrounds
- Modal dialogs
- Navbar when scrolled
- Floating action buttons
- Cards on colorful or image backgrounds

**When to use Green Glass Cards:**
- Feature highlights on white backgrounds
- Service cards
- Testimonial boxes
- Pricing cards
- Info boxes on cream backgrounds

**When NOT to use glass effects:**
- Small text elements (affects readability)
- High-contrast content areas
- Print-style content sections
- Forms with many fields (use for individual inputs, not container)

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
```

### Scale & Hierarchy

```css
/* Hero Titles */
.text-hero {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

/* Section Headings */
.text-section {
  font-size: clamp(2.5rem, 5vw, 5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Card Headings */
.text-card-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.3;
}

/* Body Text */
.text-body {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Small Text / Captions */
.text-caption {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-light);
}
```

---

## Animation System

All animations use Framer Motion for React. Timing follows natural, organic motion curves.

### Scroll Animations

```jsx
// Fade In Up (Default for most elements)
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
>
  {content}
</motion.div>

// Stagger Children (For grids)
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {children.map((child, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {child}
    </motion.div>
  ))}
</motion.div>

// Slide In from Side
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {content}
</motion.div>
```

### Hover Animations

```jsx
// Card Lift on Hover
<motion.div
  whileHover={{
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3 }
  }}
  className="glass-card-white"
>
  {content}
</motion.div>

// Button Press
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {label}
</motion.button>

// Image Scale on Hover
<motion.div
  whileHover={{
    scale: 1.1,
    transition: { duration: 0.5 }
  }}
  className="overflow-hidden"
>
  <Image src={src} alt={alt} />
</motion.div>
```

### Page Transitions

```jsx
// Page Enter Animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
>
  {page}
</motion.div>
```

### Slideshow Transitions

```jsx
// Cross-fade between slides
<AnimatePresence mode="wait">
  <motion.div
    key={currentSlide}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2, ease: "easeInOut" }}
  >
    <Image src={slides[currentSlide]} />
  </motion.div>
</AnimatePresence>
```

---

## Layout Patterns

### Hero Section (Full Screen Slideshow)

```jsx
<section className="relative h-screen overflow-hidden">
  {/* Slideshow Background */}
  <div className="absolute inset-0">
    {/* Image with gradient overlay */}
  </div>

  {/* Content Overlay */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="glass-card-white max-w-4xl p-12 rounded-3xl text-center">
      <h1>Hero Title</h1>
      <p>Subtitle</p>
      <Button>CTA</Button>
    </div>
  </div>

  {/* Navigation Dots */}
  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
    {/* Dots */}
  </div>
</section>
```

### Content Section with Background Image

```jsx
<section className="relative py-24 overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0">
    <Image src="/bg.jpg" fill className="object-cover" />
    <div className="absolute inset-0 bg-farm-green-primary/75" />
  </div>

  {/* Content */}
  <div className="relative max-w-6xl mx-auto px-6">
    <div className="glass-card-white p-12 rounded-3xl">
      {content}
    </div>
  </div>
</section>
```

### Grid Layout (Highlights/Features)

```jsx
<section className="py-24 px-6 bg-farm-cream">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-section text-center mb-16">Section Title</h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {items.map((item, i) => (
        <div key={i} className="glass-card-green p-6 rounded-3xl">
          {/* Card content */}
        </div>
      ))}
    </div>
  </div>
</section>
```

### Split Layout (Image + Content)

```jsx
<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <Image src="/image.jpg" width={600} height={400} className="rounded-3xl" />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-section mb-6">Heading</h2>
      <p className="text-body mb-8">Description</p>
      <Button>CTA</Button>
    </motion.div>
  </div>
</section>
```

---

## Component Patterns

### Button Variants

```jsx
// Primary Button (Green)
<button className="bg-farm-green-bright text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-farm-green-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  Download App
</button>

// Secondary Button (Outline)
<button className="bg-white text-farm-green-primary border-2 border-farm-green-bright px-8 py-4 rounded-full font-semibold text-lg hover:bg-farm-green-light/20 hover:-translate-y-1 transition-all duration-300">
  Learn More
</button>

// Ghost Button (Transparent)
<button className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300">
  Watch Video
</button>
```

### Card Patterns

```jsx
// Image Card with Overlay Text
<div className="relative overflow-hidden rounded-3xl h-96 group">
  <Image src="/image.jpg" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />

  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

  <div className="absolute inset-0 p-6 flex flex-col justify-end">
    <h3 className="text-2xl font-bold text-white mb-2">Title</h3>
    <p className="text-white/90">Description</p>
  </div>
</div>

// Glass Info Card
<div className="glass-card-white p-8 rounded-3xl">
  <div className="text-4xl mb-4">🌱</div>
  <h3 className="text-2xl font-bold text-farm-green-primary mb-3">Feature Title</h3>
  <p className="text-text-secondary">Feature description goes here with details.</p>
</div>
```

### Social Media Cards

```jsx
// Instagram Link Card
<a href="https://instagram.com" className="glass-card-green p-8 rounded-3xl hover:bg-farm-green-light/30 transition-all duration-300 hover:-translate-y-2 group block">
  <div className="flex items-center gap-4">
    <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-4 rounded-2xl">
      <FaInstagram className="text-4xl text-white" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-farm-green-primary mb-1">Follow us on Instagram</h3>
      <p className="text-text-secondary">Daily farm updates and stories</p>
    </div>
  </div>
</a>
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (phones, up to 640px) */
/* Default styles */

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  /* md: prefix in Tailwind */
}

/* Large devices (laptops, 1024px and up) */
@media (min-width: 1024px) {
  /* lg: prefix in Tailwind */
}

/* Extra large devices (desktops, 1280px and up) */
@media (min-width: 1280px) {
  /* xl: prefix in Tailwind */
}

/* 2XL devices (large desktops, 1536px and up) */
@media (min-width: 1536px) {
  /* 2xl: prefix in Tailwind */
}
```

---

## Image Guidelines

### Optimization

- Use Next.js Image component for all images
- Provide width and height attributes
- Use `priority` prop for above-the-fold images
- Lazy load all other images (default behavior)

```jsx
// Hero/Slideshow Images
<Image
  src="/images/slideshow/slide-1.jpg"
  alt="Satwik Farms landscape"
  fill
  className="object-cover"
  priority
  quality={90}
/>

// Regular Content Images
<Image
  src="/images/farm/cattle.jpg"
  alt="Happy cattle at Satwik Farms"
  width={800}
  height={600}
  className="rounded-3xl"
  quality={85}
/>

// Thumbnails/Small Images
<Image
  src="/images/team/member.jpg"
  alt="Team member"
  width={200}
  height={200}
  className="rounded-full"
  quality={80}
/>
```

### Image Aspect Ratios

- Hero/Slideshow: 16:9 or 21:9 (landscape)
- Feature Cards: 4:3 (landscape)
- Portrait Cards: 3:4 (portrait)
- Square Icons: 1:1
- Wide Banners: 3:1

### Recommended Image Sizes

- Hero Slideshow: 1920x1080px minimum
- Feature Images: 1200x800px
- Card Images: 800x600px
- Thumbnails: 400x400px
- Icons/Logos: SVG preferred, or 200x200px PNG

---

## Accessibility

### Color Contrast

All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18pt+): 3:1 contrast ratio minimum

**Approved Combinations:**
- ✅ `text-primary` (#1A1A1A) on `farm-white` (#FFFFFF) - 16.4:1
- ✅ `farm-green-primary` (#2D5016) on `farm-white` - 10.2:1
- ✅ White text on `farm-green-primary` - 10.2:1
- ✅ `text-secondary` (#4A5568) on `farm-white` - 8.7:1

**Avoid:**
- ❌ `farm-green-light` text on white backgrounds (low contrast)
- ❌ `farm-sunshine` text on white backgrounds

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Focus states must be clearly visible
- Tab order must be logical

```css
/* Focus Styles */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid var(--farm-green-bright);
  outline-offset: 2px;
}
```

### Screen Reader Support

- All images must have descriptive alt text
- Use semantic HTML (header, nav, main, section, footer)
- ARIA labels for icon-only buttons

```jsx
// Good
<button aria-label="Play farm tour video">
  <PlayIcon />
</button>

// Bad
<button>
  <PlayIcon />
</button>
```

---

## Performance Guidelines

### Image Optimization
- Use WebP format with JPEG fallback
- Implement lazy loading for below-fold images
- Use blur-up placeholder for smooth loading

### Animation Performance
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

### Code Splitting
- Lazy load components not needed on initial render
- Use dynamic imports for heavy libraries

```jsx
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/ui/VideoPlayer'), {
  ssr: false,
  loading: () => <div>Loading video...</div>
});
```

---

## Browser Support

**Target Browsers:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari iOS 13+
- Chrome Android (last 2 versions)

**Fallbacks for older browsers:**
- Provide `-webkit-backdrop-filter` for Safari
- Use PostCSS Autoprefixer
- Polyfill for unsupported features if needed
