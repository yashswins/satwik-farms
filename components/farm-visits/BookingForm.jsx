'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function BookingForm() {
  return (
    <section className="py-16 md:py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/farm/2.jpg"
          alt="Contact background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-farm-green-primary/85" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Ready to Visit?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto">
            Contact us today to plan your farm visit. We'll help you create an unforgettable experience!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <a
              href="tel:+255767211422"
              className="bg-white text-farm-green-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-farm-cream transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Call: +255 767 211 422
            </a>
            <a
              href="https://wa.me/255767211422?text=Hi%20Satwik%20Farms!%20I'd%20like%20to%20book%20a%20farm%20visit."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              WhatsApp Us
            </a>
            <a
              href="https://www.instagram.com/satwik.farms/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Instagram DM
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
