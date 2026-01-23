'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const slides = [
  {
    image: '/images/slideshow/1.jpg',
    title: 'Welcome to Satwik Farms',
    subtitle: 'Harvest to home: Freshness delivered'
  },
  {
    image: '/images/slideshow/2.jpg',
    title: 'Residue Free Vegetables from Kisarawe',
    subtitle: 'Grown with care, delivered fresh to your doorstep'
  },
  {
    image: '/images/slideshow/3.jpg',
    title: 'Visit Our Farm',
    subtitle: 'Experience transparency and quality first-hand'
  },
  {
    image: '/images/slideshow/4.jpg',
    title: 'Premium Dairy Products',
    subtitle: 'Fresh milk, yoghurt, and ghee from happy cattle'
  },
  {
    image: '/images/slideshow/5.jpg',
    title: 'Fresh from the Farm',
    subtitle: 'Quality you can trust, taste you can savor'
  },
  {
    image: '/images/slideshow/6.jpg',
    title: 'Nature at Its Best',
    subtitle: 'Sustainable farming for a healthier tomorrow'
  },
  {
    image: '/images/slideshow/7.jpg',
    title: 'Experience Farm Life',
    subtitle: 'Visit us and see where your food comes from'
  }
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isMounted]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!isMounted) {
    return (
      <section className="relative h-screen overflow-hidden bg-farm-green-primary">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card-white max-w-3xl p-8 md:p-12 rounded-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-farm-green-primary mb-4 md:mb-6">
              Welcome to Satwik Farms
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-text-secondary">
              Harvest to home: Freshness delivered
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Current slide and next slide (for preloading) */}
      {slides.map((slide, idx) => {
        const isCurrentOrNext = idx === currentSlide || idx === (currentSlide + 1) % slides.length;
        if (!isCurrentOrNext && idx !== 0) return null;

        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={idx === 0}
              quality={75}
              sizes="100vw"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

            {/* Content - only render for current slide */}
            {idx === currentSlide && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-6 z-10">
                <div className="glass-card-white max-w-3xl p-8 md:p-12 rounded-3xl">
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-farm-green-primary mb-4 md:mb-6">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl lg:text-3xl text-text-secondary">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-3 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? 'bg-farm-green-bright w-12'
                : 'bg-white/50 hover:bg-white/80 w-3'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 glass-card-white p-3 md:p-4 rounded-full hover:bg-white/90 transition z-20"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-farm-green-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 glass-card-white p-3 md:p-4 rounded-full hover:bg-white/90 transition z-20"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 text-farm-green-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
