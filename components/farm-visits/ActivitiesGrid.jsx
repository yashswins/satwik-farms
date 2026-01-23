'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const activities = [
  {
    title: 'Farm Tours',
    description: 'Guided tours of our fields, dairy operations, and facilities. Learn about residue free farming practices and see where your food comes from.',
    icon: '🚜',
    image: '/images/activities/1.jpg',
    features: ['Guided tours', 'Learn residue free methods', 'See dairy operations', 'Meet our team']
  },
  {
    title: 'Nature Walks & Experiences',
    description: 'Peaceful walks through our green landscapes, mud bath experiences, and connect with nature in a serene environment.',
    icon: '🌳',
    image: '/images/activities/2.jpeg',
    features: ['Nature trails', 'Mud bath fun', 'Bird watching', 'Photography spots']
  },
  {
    title: 'Meet the Farm',
    description: 'Interact with our happy cattle, plant trees, enjoy farm-fresh meals, and participate in hands-on farming activities.',
    icon: '🐄',
    image: '/images/activities/3.jpeg',
    features: ['Feed the animals', 'Plant trees', 'Fresh farm meals', 'Hands-on activities']
  }
];

export default function ActivitiesGrid() {
  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-farm-green-primary mb-4 md:mb-6">
            Activities & Experiences
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            A day at Satwik Farms is filled with learning, fun, and connection with nature
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activities.map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-56 md:h-64 hover-zoom">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={75}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-5xl md:text-6xl">
                  {activity.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-3">
                  {activity.title}
                </h3>
                <p className="text-sm md:text-base text-text-secondary mb-4">
                  {activity.description}
                </p>
                <ul className="space-y-2">
                  {activity.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm md:text-base text-text-secondary">
                      <span className="text-farm-green-bright">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
