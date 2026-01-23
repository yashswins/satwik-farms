'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function VisitHero() {
  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <Image
        src="/images/activities/1.jpg"
        alt="Farm visit"
        fill
        className="object-cover"
        priority
        sizes="100vw"
        quality={75}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="absolute inset-0 flex items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card-white max-w-3xl p-8 md:p-12 rounded-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-farm-green-primary mb-4 md:mb-6">
            Visit Our Farm
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-text-secondary">
            Experience farm life, learn about sustainable agriculture, and connect with nature
          </p>
        </motion.div>
      </div>
    </section>
  );
}
