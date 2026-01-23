'use client';

import { motion } from 'framer-motion';

export default function PricingInfo() {
  return (
    <section className="py-16 md:py-24 px-6 bg-farm-cream">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-farm-green-primary mb-4 md:mb-6">
            Visit Information
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Plan your perfect day at the farm
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card-white p-6 md:p-8 rounded-3xl"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">🎁</div>
            <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-4">
              What's Included
            </h3>
            <ul className="space-y-3 text-sm md:text-base text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Guided farm tour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Nature walk experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Farm activities participation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Tea & refreshments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Farm-fresh lunch (optional)</span>
              </li>
            </ul>
          </motion.div>

          {/* Group Visits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="glass-card-white p-6 md:p-8 rounded-3xl"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">👥</div>
            <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-4">
              Group Visits
            </h3>
            <ul className="space-y-3 text-sm md:text-base text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Schools & educational groups welcome</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Corporate team building events</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Family gatherings & celebrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Special group discounts available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Customized tour packages</span>
              </li>
            </ul>
          </motion.div>

          {/* Booking Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card-white p-6 md:p-8 rounded-3xl"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">📅</div>
            <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-4">
              How to Book
            </h3>
            <ul className="space-y-3 text-sm md:text-base text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Call us at +255 767 211 422</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Message on WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Visit our Instagram @satwik.farms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Advance booking recommended</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">✓</span>
                <span>Open weekends & holidays</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
