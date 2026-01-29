'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FarmVisitRegistrationForm() {
  const [formData, setFormData] = useState({
    visitType: 'individual',
    name: '',
    adults: '1',
    children: '0',
    mobile: '',
    dietary: '',
    visitDate: '',
    additionalNeeds: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to check if a date is a weekend
  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate weekend selection
    if (!isWeekend(formData.visitDate)) {
      alert('Please select a weekend date (Saturday or Sunday). We only conduct tours on weekends.');
      return;
    }

    const visitTypeLabels = {
      'individual': 'Individual',
      'family': 'Family',
      'group': 'Group'
    };

    // Calculate estimated cost
    const adults = parseInt(formData.adults) || 0;
    const children = parseInt(formData.children) || 0;
    const totalPeople = adults + children;

    let costEstimate = '';
    if (totalPeople >= 12) {
      costEstimate = 'Group booking (12+ people) - Special pricing available';
    } else {
      const adultCost = adults * 50000;
      const childCost = children * 30000;
      const total = adultCost + childCost;
      costEstimate = `Estimated: ${total.toLocaleString()} TSH (${adults} adults × 50,000 TSH + ${children} children × 30,000 TSH)`;
    }

    const message = `*🌾 New Farm Visit Registration*

*Visit Type:* ${visitTypeLabels[formData.visitType]}
*Name:* ${formData.name}
*Mobile:* ${formData.mobile}
*Number of Adults:* ${formData.adults}
*Number of Children:* ${formData.children}
*Preferred Visit Date:* ${new Date(formData.visitDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

*Dietary Restrictions:* ${formData.dietary || 'None'}

*Additional Needs/Comments:* ${formData.additionalNeeds || 'None'}

*${costEstimate}*

_Note: All meals are vegetarian. No alcoholic drinks permitted on farm premises._`;

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/255767211422?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        visitType: 'individual',
        name: '',
        adults: '1',
        children: '0',
        mobile: '',
        dietary: '',
        visitDate: '',
        additionalNeeds: ''
      });
    }, 5000);
  };

  return (
    <section className="py-16 md:py-24 px-6 relative overflow-hidden bg-gradient-to-br from-farm-green-primary via-farm-green-bright to-farm-green-primary">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="text-5xl md:text-6xl mb-4">🌱</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Register Your Farm Visit
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
            Join us for an unforgettable experience! Complete the form below and we'll contact you to confirm your booking.
          </p>

          {/* Pricing Banner */}
          <div className="glass-card-white max-w-3xl mx-auto p-6 rounded-2xl mb-8">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-farm-green-primary">50,000 TSH</div>
                <div className="text-sm text-text-secondary font-semibold">Per Adult</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-farm-green-bright">30,000 TSH</div>
                <div className="text-sm text-text-secondary font-semibold">Per Child</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-farm-green-primary">Special Pricing</div>
                <div className="text-sm text-text-secondary font-semibold">Groups of 12+</div>
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div className="glass-card-white max-w-3xl mx-auto p-4 rounded-xl">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-farm-green-primary font-semibold">
                <span>🥗</span>
                <span>Vegetarian Meals Only</span>
              </div>
              <div className="flex items-center gap-2 text-farm-green-primary font-semibold">
                <span>🚫</span>
                <span>No Alcohol Permitted</span>
              </div>
              <div className="flex items-center gap-2 text-farm-green-primary font-semibold">
                <span>📅</span>
                <span>Weekends Only</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card-white p-8 md:p-12 rounded-3xl shadow-2xl"
        >
          {submitted ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-6">✅</div>
              <h3 className="text-3xl md:text-4xl font-bold text-farm-green-primary mb-4">
                Registration Received!
              </h3>
              <p className="text-lg md:text-xl text-text-secondary mb-4">
                Thank you for your interest in visiting Satwik Farms!
              </p>
              <p className="text-base text-text-secondary">
                We've received your registration and will contact you shortly via WhatsApp to confirm your booking and provide additional details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Visit Type */}
              <div>
                <label htmlFor="visitType" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                  Visit Type *
                </label>
                <select
                  id="visitType"
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                >
                  <option value="individual">Individual</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                  placeholder="Your full name"
                />
              </div>

              {/* Number of People */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="adults" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                    Number of Adults *
                  </label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                  />
                </div>
                <div>
                  <label htmlFor="children" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                    Number of Children
                  </label>
                  <input
                    type="number"
                    id="children"
                    name="children"
                    value={formData.children}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                  placeholder="+255 XXX XXX XXX"
                />
              </div>

              {/* Visit Date */}
              <div>
                <label htmlFor="visitDate" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                  Preferred Visit Date (Weekends Only) *
                </label>
                <input
                  type="date"
                  id="visitDate"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  required
                  min={getMinDate()}
                  className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                />
                <p className="text-sm text-text-secondary mt-2">
                  Please select a Saturday or Sunday. Tours are only available on weekends.
                </p>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label htmlFor="dietary" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  id="dietary"
                  name="dietary"
                  value={formData.dietary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition text-base md:text-lg"
                  placeholder="Any allergies or special dietary needs? (All meals are vegetarian)"
                />
              </div>

              {/* Additional Needs */}
              <div>
                <label htmlFor="additionalNeeds" className="block text-base md:text-lg font-semibold text-farm-green-primary mb-2">
                  Additional Needs or Comments
                </label>
                <textarea
                  id="additionalNeeds"
                  name="additionalNeeds"
                  value={formData.additionalNeeds}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-farm-green-bright focus:outline-none transition resize-none text-base md:text-lg"
                  placeholder="Any special requirements or questions?"
                />
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  className="bg-farm-green-primary text-white px-10 md:px-16 py-4 md:py-5 rounded-full text-lg md:text-xl font-bold hover:bg-farm-green-bright transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Register Your Visit
                </button>
                <p className="text-sm text-text-secondary mt-4">
                  By submitting, you'll be redirected to WhatsApp to send us your registration details.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
