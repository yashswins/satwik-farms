'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function BlogSubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    category: 'farm-experience',
    content: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format the message for WhatsApp
    const categoryLabels = {
      'farm-experience': 'Farm Visit Experience',
      'recipe': 'Recipe Using Farm Produce',
      'farming-tip': 'Farming Tip or Advice',
      'testimonial': 'Product Testimonial',
      'other': 'Other'
    };

    const message = `*New Blog Story Submission*

*From:* ${formData.name}
*Email:* ${formData.email}
*Category:* ${categoryLabels[formData.category]}
*Title:* ${formData.title}

*Story:*
${formData.content}`;

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/255767211422?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        title: '',
        category: 'farm-experience',
        content: ''
      });
    }, 3000);
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/farm/1.jpg"
            alt="Submit your story"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-farm-green-primary/80" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              Share Your Farm Story
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Have you visited our farm? Share your experience, recipes, or farming tips with our community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 px-6 bg-farm-cream">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card-white p-8 md:p-12 rounded-3xl"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">✅</div>
                <h2 className="text-3xl font-bold text-farm-green-primary mb-4">
                  Thank You!
                </h2>
                <p className="text-lg text-text-secondary">
                  Your story has been submitted. We'll review it and get back to you soon!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm md:text-base font-semibold text-farm-green-primary mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm md:text-base font-semibold text-farm-green-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm md:text-base font-semibold text-farm-green-primary mb-2">
                    Story Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition"
                  >
                    <option value="farm-experience">Farm Visit Experience</option>
                    <option value="recipe">Recipe Using Farm Produce</option>
                    <option value="farming-tip">Farming Tip or Advice</option>
                    <option value="testimonial">Product Testimonial</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm md:text-base font-semibold text-farm-green-primary mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition"
                    placeholder="My Amazing Farm Visit"
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm md:text-base font-semibold text-farm-green-primary mb-2">
                    Your Story *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition resize-none"
                    placeholder="Share your experience, recipe, or farming tips..."
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn-primary px-8 md:px-12 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold"
                  >
                    Submit Your Story
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
