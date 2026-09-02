// Service-level landing page data. Each entry powers a focused SEO landing
// page targeting a specific high-intent search query. Pages live at
// /<slug> (e.g. /grocery-delivery) and are rendered via the shared
// ServiceLanding component in components/services/ServiceLanding.jsx.

const BASE_URL = 'https://satwikfarms.com';

const PROVIDER = {
  '@type': 'Organization',
  name: 'Satwik Farms',
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.png`,
  telephone: '+255767211422',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kisarawe',
    addressLocality: 'Kisarawe',
    addressRegion: 'Pwani',
    addressCountry: 'TZ',
  },
};

const SERVES = {
  '@type': 'City',
  name: 'Dar es Salaam',
  containedIn: { '@type': 'Country', name: 'Tanzania' },
};

export const services = {
  'grocery-delivery': {
    slug: 'grocery-delivery',
    icon: '🛒',
    title: 'Grocery Delivery in Dar es Salaam',
    tagline: 'Doorstep delivery across Dar es Salaam — fresh residue-free produce, dairy, and daily essentials.',
    description:
      'Everything you need delivered to your door across Dar es Salaam — fresh residue-free vegetables, fruits, dairy, grains, spices, cooking oils, personal care, and household essentials. Everything except meat, alcohol, and tobacco.',
    metaTitle: 'Grocery Delivery Dar es Salaam — Fresh Residue-Free Vegetables, Dairy & Essentials',
    metaDescription:
      'Order fresh residue-free vegetables, fruits, dairy, grains, spices, and household essentials online in Dar es Salaam. Same-day and next-day delivery. Order online or via our app.',
    keywords: [
      'grocery delivery Dar es Salaam',
      'home delivery groceries Tanzania',
      'online grocery Tanzania',
      'fresh vegetables delivery Dar es Salaam',
      'dairy delivery Dar es Salaam',
      'residue free grocery delivery',
      'online grocery order Tanzania',
    ],
    image: '/images/farm/1.jpg',
    imageAlt: 'Fresh residue-free vegetables and dairy from Satwik Farms ready for grocery delivery in Dar es Salaam',
    features: [
      'Fresh residue-free vegetables and fruits',
      'Premium dairy: milk, yoghurt, ghee',
      'Grains, pulses, spices, and cooking oils',
      'Personal care and household essentials',
      'Same-day and next-day delivery',
      'Order online in minutes or via our mobile app',
    ],
    serviceType: 'Grocery Delivery',
    relatedBlogs: [
      { slug: 'why-choose-satwik-farms', title: 'Why Choose Satwik Farms: Regenerative, Residue-Free Farming' },
      { slug: 'benefits-of-residue-free-farming', title: 'The Benefits of Residue-Free Farming' },
      { slug: 'whats-growing-january', title: "What's Growing This Month: Seasonal Harvest at Satwik Farms" },
      { slug: 'satwik-farming-technique', title: 'Satwik Farming: Holistic, Regenerative Agriculture' },
    ],
  },

  'dairy-delivery': {
    slug: 'dairy-delivery',
    icon: '🥛',
    title: 'Fresh Dairy Delivery in Dar es Salaam',
    tagline: 'Premium milk, yoghurt, and ghee from happy, ethically raised cattle — delivered fresh to your door.',
    description:
      'Premium dairy products from our own happy, ethically raised cattle in Kisarawe, delivered fresh to your door in Dar es Salaam. Daily fresh milk, traditionally cultured yoghurt (dahi), and pure ghee — with no hormones, no routine antibiotics, and no shortcuts.',
    metaTitle: 'Dairy Delivery Dar es Salaam — Fresh Milk, Yoghurt & Ghee from Kisarawe',
    metaDescription:
      'Fresh milk, traditionally cultured yoghurt, and pure ghee from happy cattle in Kisarawe — delivered to your door in Dar es Salaam. No hormones, no routine antibiotics. Order online or via our app.',
    keywords: [
      'dairy delivery Dar es Salaam',
      'fresh milk delivery Tanzania',
      'milk delivery Dar es Salaam',
      'fresh yoghurt Tanzania',
      'pure ghee Tanzania',
      'farm fresh dairy Kisarawe',
      'ethical dairy Dar es Salaam',
    ],
    image: '/images/yoghurt-cover.jpg',
    imageAlt: 'Bowl of fresh traditional yoghurt (dahi) made from milk of ethically raised cattle at Satwik Farms',
    features: [
      'Daily fresh milk from grass-fed cattle',
      'Traditionally cultured yoghurt (dahi)',
      'Pure ghee made the slow, traditional way',
      'No added hormones, no routine antibiotics',
      'Ethically raised cattle in Kisarawe',
      'Delivered fresh to your door in Dar es Salaam',
    ],
    serviceType: 'Dairy Product Delivery',
    relatedBlogs: [
      { slug: 'satwik-yoghurt-dahi', title: 'Satwik Yoghurt (Dahi): Gut-Healing Benefits' },
      { slug: 'satwik-paneer', title: 'Satwik Paneer: Pure, Fresh Cottage Cheese' },
      { slug: 'meet-our-cattle', title: 'Meet Our Cattle: The Heart of Our Dairy' },
      { slug: 'dairy-process-behind-scenes', title: 'Behind the Scenes: Our Dairy Process' },
    ],
  },

  'residue-free-vegetables': {
    slug: 'residue-free-vegetables',
    icon: '🥬',
    title: 'Residue-Free Vegetables in Dar es Salaam',
    tagline: 'Fresh, chemical-free vegetables grown sustainably in Kisarawe — delivered to Dar es Salaam.',
    description:
      'Our residue-free vegetables are grown in Kisarawe using sustainable, regenerative practices — no chemical pesticides, no synthetic fertilizers, just healthy soil and natural pest management. Harvested fresh and delivered to your door in Dar es Salaam, often within the same day.',
    metaTitle: 'Residue-Free Vegetables Dar es Salaam — Chemical-Free Fresh Produce',
    metaDescription:
      'Fresh, residue-free vegetables grown without chemical pesticides or synthetic fertilizers in Kisarawe, Tanzania. Same-day delivery to Dar es Salaam. Order online or via our app.',
    keywords: [
      'residue free vegetables Tanzania',
      'chemical free vegetables Dar es Salaam',
      'pesticide free vegetables Tanzania',
      'fresh vegetables Dar es Salaam',
      'organic vegetables Tanzania',
      'farm fresh vegetables Kisarawe',
      'healthy vegetables Tanzania',
    ],
    image: '/images/microgreen-conv.jpg',
    imageAlt: 'Fresh residue-free leafy greens and microgreens grown without chemical pesticides at Satwik Farms in Kisarawe',
    features: [
      '100% residue-free farming — no chemical pesticides',
      'No synthetic fertilizers — soil-first growing',
      'Wide seasonal variety: leafy greens, root vegetables, fruits',
      'Harvested fresh, often delivered same-day',
      'Microgreens and rare specialty produce available',
      'Farm pickup option in Kisarawe',
    ],
    serviceType: 'Fresh Vegetable Delivery',
    relatedBlogs: [
      { slug: 'benefits-of-residue-free-farming', title: 'The Benefits of Residue-Free Farming' },
      { slug: 'satwik-farming-technique', title: 'Satwik Farming: Holistic, Regenerative Agriculture' },
      { slug: 'microgreens-satwik-superfood', title: 'Microgreens: A Satwik Superfood Backed by Science & Ayurveda' },
      { slug: 'whats-growing-january', title: "What's Growing This Month: Seasonal Harvest" },
      { slug: 'garden-salad-recipe', title: 'Fresh Garden Salad with Satwik Greens' },
    ],
  },

  'wellness-products': {
    slug: 'wellness-products',
    icon: '🍯',
    title: 'Natural Wellness Products from Satwik Farms',
    tagline: 'Raw forest honey, herbal teas, ayurvedic foods, and handmade soaps — chemical-free, traditionally crafted.',
    description:
      'Our wellness range brings you the gentlest, most traditional preparations: raw unfiltered forest honey from the wild Miombo forests of Kisarawe, herbal teas, ayurvedic-style foods, and handmade neem-tulsi soaps with virgin coconut oil. Every product is chemical-free and crafted in small batches.',
    metaTitle: 'Natural Wellness Products Tanzania — Raw Honey, Herbal Teas & Handmade Soaps',
    metaDescription:
      'Raw forest honey from Kisarawe, herbal teas, ayurvedic foods, and handmade neem-tulsi soaps. Chemical-free, traditionally crafted wellness products delivered in Dar es Salaam.',
    keywords: [
      'raw honey Tanzania',
      'forest honey Kisarawe',
      'natural honey Dar es Salaam',
      'handmade soap Tanzania',
      'neem tulsi soap',
      'ayurvedic products Tanzania',
      'herbal tea Tanzania',
      'natural wellness products Dar es Salaam',
    ],
    image: '/images/honey.jpg',
    imageAlt: 'Jar of raw unfiltered forest honey harvested from the wild Miombo forests of Kisarawe, Tanzania',
    features: [
      'Raw, unheated, unfiltered forest honey',
      'Handmade neem-tulsi soaps with virgin coconut oil',
      'Herbal teas (guava leaf and more)',
      'Ayurvedic-style ladoos and seed mixes',
      'Small batches, traditionally crafted',
      'No additives, preservatives, or synthetic fragrances',
    ],
    serviceType: 'Wellness Product Delivery',
    relatedBlogs: [
      { slug: 'raw-forest-honey-kisarawe', title: 'Raw Forest Honey from Kisarawe: Benefits & Ayurvedic Uses' },
      { slug: 'neem-tulsi-soap', title: 'Neem Tulsi Soap with Virgin Coconut Oil' },
      { slug: 'guava-leaf-tea-benefits', title: 'Guava Leaf Tea: Ancient Healing Brew' },
      { slug: 'satwik-paustik-ladoo', title: 'Satwik Paustik Ladoo: Sugar-Free Energy Snack' },
      { slug: 'roasted-seed-mix', title: 'The Power of Our Roasted Seed Mix' },
    ],
  },
};

export function getService(slug) {
  return services[slug] || null;
}

export function getAllServiceSlugs() {
  return Object.keys(services);
}

export function buildServiceJsonLd(service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    serviceType: service.serviceType,
    image: `${BASE_URL}${service.image}`,
    url: `${BASE_URL}/${service.slug}`,
    provider: PROVIDER,
    areaServed: SERVES,
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        serviceUrl: `${BASE_URL}/order`,
        servicePhone: '+255767211422',
        availableLanguage: ['en', 'sw'],
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: service.title,
      itemListElement: service.features.map((f) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: f },
      })),
    },
  };
}
