'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OurStory() {
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-farm-green-primary mb-4 md:mb-6">
            Our Story
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
            Bringing the bounty of residue free farming from Kisarawe to your doorstep
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hover-zoom rounded-3xl overflow-hidden"
          >
            <Image
              src="/images/farm/1.jpg"
              alt="Satwik Farms fields"
              width={600}
              height={400}
              className="rounded-3xl shadow-lg w-full h-auto"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-farm-green-primary mb-4 md:mb-6">
              Discover the taste of Tanzania
            </h2>
            <p className="text-base md:text-lg text-text-secondary mb-4">
              Satwik Farms brings the bounty of our residue free produce directly from our farm in Kisarawe to your doorstep. Experience the vibrant flavors and exceptional quality that only comes from fresh, carefully nurtured ingredients.
            </p>
            <p className="text-base md:text-lg text-text-secondary mb-4">
              We grow our vegetables residue free and have cattle through which we deliver the highest quality milk, yoghurt, ghee, and more. We never compromise on quality - customer satisfaction is of utmost importance to us.
            </p>
            <p className="text-base md:text-lg text-text-secondary">
              We are transparent about everything, which is why we encourage people to come to our farms and experience it themselves. Taste the difference with Satwik Farms and elevate your meals with nature's best.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
