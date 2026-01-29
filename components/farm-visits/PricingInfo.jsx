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
          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card-white p-6 md:p-8 rounded-3xl border-4 border-farm-green-bright"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">💰</div>
            <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-6">
              Pricing
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-farm-green-primary/5 rounded-xl">
                <span className="text-base md:text-lg font-semibold text-farm-green-primary">Adults</span>
                <span className="text-xl md:text-2xl font-bold text-farm-green-primary">50,000 TSH</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-farm-green-bright/10 rounded-xl">
                <span className="text-base md:text-lg font-semibold text-farm-green-primary">Children</span>
                <span className="text-xl md:text-2xl font-bold text-farm-green-bright">30,000 TSH</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-farm-green-primary/10 to-farm-green-bright/10 rounded-xl">
              <p className="text-sm md:text-base text-text-secondary font-semibold text-center">
                Groups of 12+ people: Special pricing available
              </p>
            </div>
          </motion.div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
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
                <span>Farm-fresh vegetarian lunch</span>
              </li>
            </ul>
          </motion.div>

          {/* Important Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card-white p-6 md:p-8 rounded-3xl border-2 border-farm-green-bright/30"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">ℹ️</div>
            <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-4">
              Important Information
            </h3>
            <ul className="space-y-3 text-sm md:text-base text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">🥗</span>
                <span><strong>Vegetarian meals only:</strong> We serve only vegetarian food on our farm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">🚫</span>
                <span><strong>No alcohol:</strong> Alcoholic drinks are not permitted on farm premises</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">📅</span>
                <span><strong>Weekends only:</strong> Tours available Saturdays and Sundays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-farm-green-bright mt-1">📞</span>
                <span><strong>Advance booking required:</strong> Please book at least 2 days in advance</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Group Visits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 md:mt-16"
        >
          <div className="glass-card-white p-8 md:p-12 rounded-3xl">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="text-6xl md:text-7xl">👥</div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-farm-green-primary mb-4">
                  Group Visits Welcome
                </h3>
                <ul className="space-y-2 text-sm md:text-base text-text-secondary">
                  <li className="flex items-start gap-2 justify-center md:justify-start">
                    <span className="text-farm-green-bright mt-1">✓</span>
                    <span>Schools & educational groups</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center md:justify-start">
                    <span className="text-farm-green-bright mt-1">✓</span>
                    <span>Corporate team building events</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center md:justify-start">
                    <span className="text-farm-green-bright mt-1">✓</span>
                    <span>Family gatherings & celebrations</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center md:justify-start">
                    <span className="text-farm-green-bright mt-1">✓</span>
                    <span>Customized tour packages available</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
