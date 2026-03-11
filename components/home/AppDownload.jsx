'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { FaWhatsapp } from 'react-icons/fa';

export default function AppDownload() {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.satwikfarms';
  const appStoreUrl = 'https://apps.apple.com/us/app/satwikfarms/id6759561187';
  const whatsappUrl = 'https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM';

  return (
    <section id="app-download" className="py-16 md:py-24 px-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/farm/1.jpg"
          alt="Farm background"
          fill
          className="object-cover"
          sizes="100vw"
          quality={75}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-farm-green-primary/80" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Order Fresh from Our Farm
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Download our app for the easiest way to browse products and place orders — available on Android and iPhone
          </p>
        </motion.div>

        <div className="glass-card-white p-8 md:p-12 rounded-3xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* QR Codes */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              {/* Android QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-farm-green-primary">
                  <QRCodeSVG
                    value={playStoreUrl}
                    size={160}
                    level="H"
                    includeMargin
                    fgColor="#2D5016"
                  />
                </div>
                <p className="text-center mt-3 font-bold text-farm-green-primary text-base md:text-lg">
                  Android
                </p>
                <p className="text-xs text-text-secondary">Google Play Store</p>
              </div>

              {/* iOS QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-farm-green-primary">
                  <QRCodeSVG
                    value={appStoreUrl}
                    size={160}
                    level="H"
                    includeMargin
                    fgColor="#2D5016"
                  />
                </div>
                <p className="text-center mt-3 font-bold text-farm-green-primary text-base md:text-lg">
                  iPhone
                </p>
                <p className="text-xs text-text-secondary">Apple App Store</p>
              </div>
            </motion.div>

            {/* Download Options */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-farm-green-primary mb-4 md:mb-6">
                Get Started Today
              </h3>
              <p className="text-sm md:text-base text-text-secondary mb-4">
                Browse our fresh residue free vegetables, premium dairy products (milk, yoghurt, ghee), and place orders for home delivery to Dar es Salaam or farm pickup in Kisarawe.
              </p>
              <p className="text-sm md:text-base text-text-secondary mb-6 md:mb-8">
                Experience the taste of Tanzania with produce grown residue free and delivered fresh from our farm.
              </p>

              {/* App Download Buttons — Primary */}
              <div className="flex flex-col items-center md:items-start gap-3 mb-3">
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src="/images/play-store-download.svg"
                    alt="Get it on Google Play"
                    width={195}
                    height={58}
                    loading="lazy"
                  />
                </a>
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src="/images/app-store-download.svg"
                    alt="Download on the App Store"
                    width={180}
                    height={54}
                    loading="lazy"
                  />
                </a>
              </div>
              <p className="text-xs text-text-secondary italic mb-6">
                Join 5,000+ happy customers!
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-text-secondary">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* WhatsApp — Secondary */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
              >
                <FaWhatsapp className="text-xl" />
                <span className="text-sm">Join our WhatsApp group for updates</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
