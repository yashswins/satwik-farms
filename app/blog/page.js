'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'What\'s Growing This Month: January Harvest',
    excerpt: 'Discover the fresh produce available this month from our organic farm. From leafy greens to juicy tomatoes, see what\'s in season.',
    image: '/images/farm/1.jpg',
    date: 'January 15, 2024',
    category: 'Farm Updates'
  },
  {
    id: 2,
    title: 'The Benefits of Organic Farming',
    excerpt: 'Learn why organic farming matters for your health and the environment. We explain our chemical-free approach to agriculture.',
    image: '/images/farm/2.jpg',
    date: 'January 10, 2024',
    category: 'Education'
  },
  {
    id: 3,
    title: 'Farm Visit Highlights: School Trip Success',
    excerpt: 'Last week we hosted students from Dar es Salaam International School. See photos and hear about their amazing farm experience.',
    image: '/images/activities/1.jpg',
    date: 'January 5, 2024',
    category: 'Events'
  },
  {
    id: 4,
    title: 'Fresh Recipes: Garden Salad with Satwik Greens',
    excerpt: 'A simple and delicious salad recipe using fresh produce from our farm. Perfect for a healthy lunch or dinner side.',
    image: '/images/farm/3.jpg',
    date: 'December 28, 2023',
    category: 'Recipes'
  },
  {
    id: 5,
    title: 'Behind the Scenes: Our Dairy Process',
    excerpt: 'Take a look at how we produce fresh milk, yoghurt, and ghee from our happy, healthy cattle.',
    image: '/images/farm/4.jpg',
    date: 'December 20, 2023',
    category: 'Farm Updates'
  },
  {
    id: 6,
    title: 'Meet Our Cattle: The Heart of Our Dairy',
    excerpt: 'Get to know the stars of Satwik Farms - our well-cared-for cattle who provide the freshest dairy products.',
    image: '/images/activities/3.jpeg',
    date: 'December 15, 2023',
    category: 'Farm Life'
  }
];

export default function BlogPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 bg-farm-cream">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-farm-green-primary mb-4 md:mb-6">
              Farm Blog
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Stories from the farm, seasonal updates, recipes, and farming tips
            </p>
            <Link
              href="/blog/submit"
              className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg inline-block"
            >
              Share Your Story
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 md:h-56 hover-zoom">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={75}
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-farm-green-bright text-white px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs md:text-sm text-text-light mb-2">{post.date}</p>
                  <h2 className="text-lg md:text-xl font-bold text-farm-green-primary mb-3">
                    {post.title}
                  </h2>
                  <p className="text-sm md:text-base text-text-secondary mb-4">
                    {post.excerpt}
                  </p>
                  <button className="text-farm-green-bright hover:text-farm-green-primary font-semibold text-sm md:text-base transition">
                    Read More →
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
