'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

function Counter({ value, suffix = '' }) {
  const count = useMotionValue(0);
  const decimals = Number.isInteger(value)
    ? 0
    : String(value).split('.')[1]?.length || 0;
  const rounded = useTransform(count, (latest) => {
    if (decimals === 0) {
      return String(Math.round(latest));
    }
    const factor = 10 ** decimals;
    return (Math.round(latest * factor) / factor).toFixed(decimals);
  });
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(count, value, { duration: 2, ease: 'easeOut' });
      return controls.stop;
    }
  }, [count, value, inView]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 5000,
    suffix: '+',
    label: 'Happy Customers',
    icon: '😊'
  },
  {
    value: 25000,
    suffix: '+',
    label: 'kg Monthly Produce',
    icon: '🌾'
  },
  {
    value: 100,
    suffix: '%',
    label: 'Residue Free',
    icon: '✅'
  },
  {
    value: 4.6,
    suffix: '★',
    label: 'Customer Satisfaction',
    icon: '⭐'
  }
];

export default function StatsCounter() {
  return (
    <section className="py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animated-gradient opacity-90" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Our Impact
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Numbers that speak for our commitment to quality and sustainability
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-card-white p-6 md:p-8 rounded-3xl text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">{stat.icon}</div>
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-farm-green-primary mb-2 md:mb-3">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm md:text-base text-text-secondary font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
