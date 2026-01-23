'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 navbar-glass ${
        scrolled ? 'shadow-lg' : 'shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src="/images/logo_transparent.png"
              alt="Satwik Farms"
              fill
              className="object-contain"
              priority
              quality={90}
              sizes="48px"
            />
          </div>
          <span className="text-2xl font-bold text-farm-green-primary">
            Satwik Farms
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/about"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            About Us
          </Link>
          <Link
            href="/farm-visits"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            Farm Visits
          </Link>
          <Link
            href="/ventures"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            Our Ventures
          </Link>
          <Link
            href="/blog"
            className="text-text-primary hover:text-farm-green-bright transition font-medium"
          >
            Blog
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.satwikfarms.satwik"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-6 py-3 rounded-full"
          >
            Download App
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-farm-green-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-card-white px-6 pb-4 space-y-4"
        >
          <Link
            href="/about"
            className="block text-text-primary hover:text-farm-green-bright py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            href="/farm-visits"
            className="block text-text-primary hover:text-farm-green-bright py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Farm Visits
          </Link>
          <Link
            href="/ventures"
            className="block text-text-primary hover:text-farm-green-bright py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Our Ventures
          </Link>
          <Link
            href="/blog"
            className="block text-text-primary hover:text-farm-green-bright py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.satwikfarms.satwik"
            target="_blank"
            rel="noopener noreferrer"
            className="block btn-primary px-6 py-3 rounded-full text-center"
          >
            Download App
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
}
