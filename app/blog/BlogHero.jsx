'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BlogHero() {
  return (
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
  );
}
