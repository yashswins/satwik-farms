'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    location: 'Dar es Salaam',
    rating: 5,
    text: 'The freshest vegetables I\'ve ever had! Satwik Farms delivers exactly what they promise. The quality is outstanding and you can really taste the difference.',
    avatar: '👩'
  },
  {
    name: 'John Kamau',
    location: 'Mikocheni',
    rating: 5,
    text: 'Amazing dairy products! The milk is so fresh and the yoghurt is absolutely delicious. I love supporting a local farm that cares about quality.',
    avatar: '👨'
  },
  {
    name: 'Amina Hassan',
    location: 'Masaki',
    rating: 5,
    text: 'We took our kids for a farm visit and it was wonderful! Educational, fun, and the kids loved meeting the animals. Highly recommend!',
    avatar: '👩‍🦱'
  },
  {
    name: 'David Mwamba',
    location: 'Oyster Bay',
    rating: 5,
    text: 'The transparency and commitment to organic farming is impressive. I trust Satwik Farms with my family\'s food and health.',
    avatar: '👨‍🦲'
  },
  {
    name: 'Grace Kimaro',
    location: 'Mbezi Beach',
    rating: 5,
    text: 'Best farm-to-table experience in Tanzania! The delivery is always on time and the produce stays fresh for days. Absolutely love it!',
    avatar: '👩‍🦰'
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-farm-green-primary mb-4 md:mb-6">
            What Our Customers Say
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Real experiences from families who trust Satwik Farms
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="glass-card-white p-8 md:p-12 rounded-3xl"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4 md:mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <FaStar key={i} className="text-farm-sunshine text-xl md:text-2xl" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-lg md:text-xl lg:text-2xl text-text-secondary text-center mb-6 md:mb-8 italic leading-relaxed">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <div className="text-4xl md:text-5xl">
                  {testimonials[currentIndex].avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg md:text-xl text-farm-green-primary">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-sm md:text-base text-text-secondary">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToTestimonial(idx)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-farm-green-bright w-12'
                    : 'bg-gray-300 hover:bg-gray-400 w-3'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
