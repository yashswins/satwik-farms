'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaExpand, FaCompress, FaFacebook } from 'react-icons/fa';

export default function SocialConnect() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-farm-green-primary mb-4 md:mb-6">
            Stay Connected
          </h2>
          <p className="text-lg md:text-xl text-text-secondary">
            Follow our journey and join our community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Farm Tour Video */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-4 md:p-6 rounded-3xl"
          >
            <h3 className="text-xl md:text-2xl font-bold text-farm-green-primary mb-3 md:mb-4">
              Experience Our Farm
            </h3>
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer" onClick={toggleFullscreen}>
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/videos/farm-tour.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Fullscreen overlay button */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 p-4 rounded-full">
                  <FaExpand className="text-2xl text-farm-green-primary" />
                </div>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-2 text-center">
              Click to watch in fullscreen
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4 md:gap-6"
          >
            {/* Instagram */}
            <a
              href="https://www.instagram.com/satwik.farms/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 md:p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-3 md:p-4 rounded-2xl flex-shrink-0">
                  <FaInstagram className="text-2xl md:text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-farm-green-primary mb-1">
                    Follow us on Instagram
                  </h3>
                  <p className="text-sm md:text-base text-text-secondary">
                    @satwik.farms - Daily updates and farm life
                  </p>
                </div>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1BPLUDwqWq/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 md:p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-blue-600 p-3 md:p-4 rounded-2xl flex-shrink-0">
                  <FaFacebook className="text-2xl md:text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-farm-green-primary mb-1">
                    Follow us on Facebook
                  </h3>
                  <p className="text-sm md:text-base text-text-secondary">
                    Stay connected with our community
                  </p>
                </div>
              </div>
            </a>

            {/* WhatsApp Group */}
            <a
              href="https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 md:p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-green-500 p-3 md:p-4 rounded-2xl flex-shrink-0">
                  <FaWhatsapp className="text-2xl md:text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-farm-green-primary mb-1">
                    Join our WhatsApp Group
                  </h3>
                  <p className="text-sm md:text-base text-text-secondary">
                    Browse catalogue, place orders, and get exclusive offers
                  </p>
                </div>
              </div>
            </a>

            {/* Google Maps */}
            <a
              href="https://share.google/Pmtmn6QtK6gez9ExY"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 md:p-8 rounded-3xl hover:bg-farm-green-light/20 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-red-500 p-3 md:p-4 rounded-2xl flex-shrink-0">
                  <FaMapMarkerAlt className="text-2xl md:text-4xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-farm-green-primary mb-1">
                    Visit Us in Kisarawe
                  </h3>
                  <p className="text-sm md:text-base text-text-secondary">
                    Get directions to our farm
                  </p>
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
