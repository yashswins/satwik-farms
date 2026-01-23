'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function QuickVisitCTA() {
  return (
    <section className="py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/farm/3.jpg"
          alt="Farm visit background"
          fill
          className="object-cover"
          sizes="100vw"
          quality={75}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-farm-green-primary/90 to-farm-green-bright/80" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Ready to Visit Our Farm?
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto">
            Experience farm life firsthand. Join us for guided tours, nature walks,
            and hands-on activities for the whole family.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <Link
              href="/farm-visits"
              className="bg-white text-farm-green-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-farm-cream transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Plan Your Visit
            </Link>
            <a
              href="tel:+255767211422"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Call Us: +255 767 211 422
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
