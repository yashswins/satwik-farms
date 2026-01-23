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
    image: '/images/ventures/farm-visits.jpg',
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
    id: 'residue-free-produce',
    title: 'Residue Free Produce',
    icon: '🌾',
    description: 'Fresh vegetables grown without chemical residues, delivered to your door',
    image: '/images/ventures/residue-free-produce.jpg',
    features: [
      '100% residue free farming',
      'No harmful chemical residues',
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
    image: '/images/ventures/dairy-products.jpg',
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
    id: 'holistic-living',
    title: 'Holistic (Satwik) Living',
    icon: '🧘',
    description: 'Embrace a balanced lifestyle rooted in nature and traditional wisdom',
    image: '/images/ventures/holistic-living.jpg',
    features: [
      'Natural living practices',
      'Traditional Satwik lifestyle guidance',
      'Farm-to-table healthy eating',
      'Mindful living workshops',
      'Connection with nature',
      'Sustainable lifestyle tips'
    ]
  },
  {
    id: 'wellness-products',
    title: 'Wellness Products',
    icon: '🍯',
    description: 'Natural honey and handmade soaps crafted with care from our farm',
    image: '/images/ventures/wellness-products.jpg',
    features: [
      'Pure natural honey',
      'Handmade natural soaps',
      'Chemical-free ingredients',
      'Farm-fresh quality',
      'Traditional recipes',
      'Wellness gift sets'
    ]
  },
  {
    id: 'future',
    title: 'Future Ventures',
    icon: '🚀',
    description: 'Expanding our impact on sustainable agriculture',
    image: '/images/ventures/future-ventures.jpg',
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
            From farm visits to residue free produce, discover all that Satwik Farms has to offer
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
