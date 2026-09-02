'use client';

import Link from 'next/link';
import AppStoreBadges from '@/components/shared/AppStoreBadges';

import { motion } from 'framer-motion';

const categories = [
  { icon: '🥬', label: 'Fresh Vegetables' },
  { icon: '🍎', label: 'Fresh Fruits' },
  { icon: '🥛', label: 'Dairy Products' },
  { icon: '🌾', label: 'Grains & Pulses' },
  { icon: '🧂', label: 'Spices & Masala' },
  { icon: '🫙', label: 'Cooking Oils' },
  { icon: '🧴', label: 'Personal Care' },
  { icon: '🏠', label: 'Household Essentials' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export default function GroceryDelivery() {
  return (
    <section className="py-16 md:py-24 px-6 bg-farm-green-primary">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block bg-farm-green-bright text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
            Home Delivery — Dar es Salaam
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Your Complete Grocery Delivery
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Everything you need, delivered to your door. From fresh farm produce to daily household
            essentials — we deliver it all across Dar es Salaam.
            <span className="block mt-2 text-white/60 text-base">
              (Everything except meat, alcohol &amp; tobacco)
            </span>
          </p>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 mb-12 md:mb-16"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white/10 hover:bg-white/20 rounded-2xl p-4 text-center transition-colors duration-200 cursor-default"
            >
              <div className="text-3xl md:text-4xl mb-2">{cat.icon}</div>
              <p className="text-white text-xs md:text-sm font-medium leading-tight">{cat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Ordering online is the primary path; the app badges are the secondary one. */}
          <Link
            href="/order"
            className="bg-farm-green-bright hover:bg-farm-green-primary text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Order Online
          </Link>
          <AppStoreBadges className="justify-center" />
          <a
            href="/ventures"
            className="bg-white text-farm-green-primary font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:bg-farm-cream shadow-lg"
          >
            See All Products
          </a>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-white/50 text-sm mt-8"
        >
          Same-day &amp; next-day delivery available · Farm-fresh produce harvested daily · 5,000+ happy customers
        </motion.p>

      </div>
    </section>
  );
}
