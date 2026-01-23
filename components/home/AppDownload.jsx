'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { FaWhatsapp } from 'react-icons/fa';

export default function AppDownload() {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.satwikfarms.satwik';
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
            Place orders through WhatsApp or download our Android app for easy browsing and ordering
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
              className="flex flex-col items-center gap-6"
            >
              {/* WhatsApp QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border-4 border-green-500">
                  <Image
                    src="/images/WhatsApp QR.jpeg"
                    alt="Scan for WhatsApp Catalog"
                    width={180}
                    height={180}
                    className="rounded-lg"
                    quality={90}
                  />
                </div>
                <p className="text-center mt-3 font-bold text-green-600 text-base md:text-lg">
                  Scan for WhatsApp Catalog
                </p>
                <p className="text-xs text-text-secondary">Primary Ordering</p>
              </div>

              {/* Play Store QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                  <QRCodeSVG
                    value={playStoreUrl}
                    size={180}
                    level="H"
                    includeMargin
                    fgColor="#2D5016"
                  />
                </div>
                <p className="text-center mt-3 font-semibold text-farm-green-primary text-base md:text-lg">
                  Scan for Android App
                </p>
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

              {/* WhatsApp Button - Primary */}
              <div className="mb-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FaWhatsapp className="text-3xl" />
                  <div className="text-left">
                    <div className="text-sm opacity-90">Order Now on</div>
                    <div className="text-lg">WhatsApp</div>
                  </div>
                </a>
                <p className="text-xs text-text-secondary mt-2 italic">
                  Our main ordering platform - Join 5000+ happy customers!
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-text-secondary">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Play Store Download */}
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src="/images/play-store.png"
                  alt="Get it on Google Play"
                  width={200}
                  height={60}
                  quality={90}
                  loading="lazy"
                />
              </a>
              <p className="text-xs text-text-secondary mt-2">
                Download our Android app for the best experience
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
