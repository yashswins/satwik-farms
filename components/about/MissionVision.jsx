'use client';

import { motion } from 'framer-motion';

export default function MissionVision() {
  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card-green p-8 md:p-12 rounded-3xl"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">🎯</div>
            <h2 className="text-2xl md:text-3xl font-bold text-farm-green-primary mb-4 md:mb-6">
              Our Mission
            </h2>
            <p className="text-base md:text-lg text-text-secondary">
              To deliver the freshest, highest-quality residue free produce and dairy products from our farm to your table, while maintaining complete transparency in our farming practices and building lasting relationships with our community through trust and exceptional customer service.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card-green p-8 md:p-12 rounded-3xl"
          >
            <div className="text-4xl md:text-5xl mb-4 md:mb-6">🌟</div>
            <h2 className="text-2xl md:text-3xl font-bold text-farm-green-primary mb-4 md:mb-6">
              Our Vision
            </h2>
            <p className="text-base md:text-lg text-text-secondary">
              To become Tanzania's most trusted source of residue free produce and premium dairy products, setting the standard for sustainable farming practices, quality assurance, and customer satisfaction while nurturing a healthier, more connected community.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 md:mt-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-farm-green-primary text-center mb-8 md:mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="glass-card-white p-6 md:p-8 rounded-3xl text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">🌱</div>
              <h3 className="text-lg md:text-xl font-bold text-farm-green-primary mb-2 md:mb-3">
                Quality First
              </h3>
              <p className="text-sm md:text-base text-text-secondary">
                We never compromise on quality - from seed to harvest to delivery
              </p>
            </div>
            <div className="glass-card-white p-6 md:p-8 rounded-3xl text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">🤝</div>
              <h3 className="text-lg md:text-xl font-bold text-farm-green-primary mb-2 md:mb-3">
                Transparency
              </h3>
              <p className="text-sm md:text-base text-text-secondary">
                Open doors, open books - experience our farm firsthand
              </p>
            </div>
            <div className="glass-card-white p-6 md:p-8 rounded-3xl text-center">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">❤️</div>
              <h3 className="text-lg md:text-xl font-bold text-farm-green-primary mb-2 md:mb-3">
                Customer Satisfaction
              </h3>
              <p className="text-sm md:text-base text-text-secondary">
                Your happiness and health are our top priorities
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
