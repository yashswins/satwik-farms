'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ventures = [
  {
    id: 'farm-visits',
    title: 'Farm Visits',
    icon: '🚜',
    description: 'Educational and fun experiences for families, schools, and groups',
    image: '/images/activities/1.jpg',
    features: [
      'Guided farm tours',
      'Nature walks and mud baths',
      'Hands-on farming activities',
      'Meet our happy cattle',
      'Fresh farm meals',
      'Perfect for all ages'
    ]
  },
  {
    id: 'organic-produce',
    title: 'Organic Produce',
    icon: '🌾',
    description: 'Fresh vegetables grown without chemicals, delivered to your door',
    image: '/images/farm/1.jpg',
    features: [
      '100% organic farming',
      'Chemical-free vegetables',
      'Seasonal variety',
      'Home delivery in Dar es Salaam',
      'Farm pickup available',
      'Order via our app'
    ]
  },
  {
    id: 'dairy',
    title: 'Dairy Products',
    icon: '🥛',
    description: 'Premium dairy from happy, healthy cattle',
    image: '/images/farm/2.jpg',
    features: [
      'Fresh milk daily',
      'Homemade yoghurt',
      'Pure ghee',
      'Ethically raised cattle',
      'No hormones or antibiotics',
      'Farm-fresh quality'
    ]
  },
  {
    id: 'education',
    title: 'Educational Programs',
    icon: '📚',
    description: 'Learn about sustainable agriculture and organic farming',
    image: '/images/farm/3.jpg',
    features: [
      'School field trips',
      'Agricultural workshops',
      'Sustainability training',
      'Hands-on learning',
      'Environmental education',
      'Custom programs available'
    ]
  },
  {
    id: 'events',
    title: 'Corporate Events',
    icon: '🎉',
    description: 'Team building and corporate gatherings in nature',
    image: '/images/farm/4.jpg',
    features: [
      'Team building activities',
      'Corporate retreats',
      'Meeting spaces available',
      'Farm-to-table catering',
      'Unique venue experience',
      'Customized packages'
    ]
  },
  {
    id: 'future',
    title: 'Future Ventures',
    icon: '🚀',
    description: 'Expanding our impact on sustainable agriculture',
    image: '/images/activities/3.jpeg',
    features: [
      'Agro-tourism expansion',
      'Farm stay accommodations',
      'Processing facilities',
      'Value-added products',
      'Community partnerships',
      'Innovation in farming'
    ]
  }
];

export default function VenturesTabs() {
  const [activeTab, setActiveTab] = useState(0);

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-farm-green-primary mb-4 md:mb-6">
            Our Ventures
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
            From farm visits to organic produce, discover all that Satwik Farms has to offer
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {ventures.map((venture, idx) => (
            <button
              key={venture.id}
              onClick={() => setActiveTab(idx)}
              className={`px-4 md:px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
                activeTab === idx
                  ? 'bg-farm-green-bright text-white shadow-lg scale-105'
                  : 'bg-white text-farm-green-primary hover:bg-farm-green-light/20'
              }`}
            >
              <span className="mr-2">{venture.icon}</span>
              {venture.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card-white p-8 md:p-12 rounded-3xl"
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="hover-zoom rounded-3xl overflow-hidden">
              <Image
                src={ventures[activeTab].image}
                alt={ventures[activeTab].title}
                width={600}
                height={400}
                className="rounded-3xl w-full h-auto"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={75}
                loading="lazy"
              />
            </div>

            <div>
              <div className="text-5xl md:text-6xl mb-4 md:mb-6">
                {ventures[activeTab].icon}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-farm-green-primary mb-4">
                {ventures[activeTab].title}
              </h2>
              <p className="text-base md:text-lg text-text-secondary mb-6 md:mb-8">
                {ventures[activeTab].description}
              </p>

              <div className="space-y-3">
                {ventures[activeTab].features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-farm-green-bright text-xl">✓</span>
                    <span className="text-sm md:text-base text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <a
                  href="tel:+255767211422"
                  className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg inline-block"
                >
                  Learn More - Call Us
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
