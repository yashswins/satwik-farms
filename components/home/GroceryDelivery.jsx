'use client';

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
          <a
            href="https://wa.me/255767211422"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BA59] text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order on WhatsApp
          </a>
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
