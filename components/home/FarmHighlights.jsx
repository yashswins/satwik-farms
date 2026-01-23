'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const highlights = [
  {
    title: 'Residue Free Farming',
    description: 'Sustainable practices for healthier, chemical-residue-free produce',
    image: '/images/farm/1.jpg',
    icon: '🌾'
  },
  {
    title: 'Quality Dairy',
    description: 'Fresh milk from happy, ethically-raised cattle',
    image: '/images/farm/2.jpg',
    icon: '🥛'
  },
  {
    title: 'Farm Visits',
    description: 'Experience farm life with activities for all ages',
    image: '/images/farm/3.jpg',
    icon: '🚜',
    link: '/farm-visits'
  },
  {
    title: 'Natural Products',
    description: 'Handmade natural soaps, multani mitti (fuller\'s earth mask) and natural honey',
    image: '/images/farm/4.jpg',
    icon: '🌿'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8
    }
  }
};

export default function FarmHighlights() {
  return (
    <section className="py-16 md:py-24 px-6 bg-farm-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-farm-green-primary mb-4 md:mb-6">
            What Makes Us Special
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Committed to sustainable farming and connecting people with nature
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {highlights.map((item, idx) => {
            const CardContent = (
              <>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="text-4xl md:text-5xl mb-3 md:mb-4">{item.icon}</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm md:text-base text-white/90">{item.description}</p>
                </div>
              </>
            );

            return item.link ? (
              <Link key={idx} href={item.link}>
                <motion.div
                  variants={itemVariants}
                  className="relative overflow-hidden rounded-3xl h-80 md:h-96 group hover-zoom cursor-pointer"
                >
                  {CardContent}
                </motion.div>
              </Link>
            ) : (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl h-80 md:h-96 group hover-zoom"
              >
                {CardContent}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
