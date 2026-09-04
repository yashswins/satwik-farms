import Link from 'next/link';
import { FaInstagram, FaWhatsapp, FaPhone, FaMapMarkerAlt, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-farm-green-primary text-white py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-bold mb-4">Satwik Farms</h3>
          <p className="text-white/80 mb-4">
            Harvest to home: Freshness delivered
          </p>
          <p className="text-white/80 text-sm">
            Residue free vegetables and premium dairy from Kisarawe, Tanzania
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
          <ul className="space-y-2 text-white/80">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link href="/farm-visits" className="hover:text-white transition">Farm Visits</Link></li>
            <li><Link href="/ventures" className="hover:text-white transition">Our Ventures</Link></li>
            <li><Link href="/gallery" className="hover:text-white transition">Gallery</Link></li>
            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
            <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-lg">Contact Us</h4>
          <div className="space-y-3 text-white/80">
            <a href="tel:+255767211422" className="flex items-center gap-2 hover:text-white transition">
              <FaPhone className="text-farm-green-light" />
              <span>+255 767 211 422</span>
            </a>
            <a
              href="https://share.google/Pmtmn6QtK6gez9ExY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition"
            >
              <FaMapMarkerAlt className="text-farm-green-light" />
              <span>Kisarawe, Tanzania</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-lg">Follow Us</h4>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/satwik.farms/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"
              aria-label="Instagram"
            >
              <FaInstagram className="text-2xl" />
            </a>
            <a
              href="https://www.facebook.com/share/1BPLUDwqWq/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"
              aria-label="Facebook"
            >
              <FaFacebook className="text-2xl" />
            </a>
            <a
              href="https://chat.whatsapp.com/Fe6U6ym7i0FCNJzoN951fM"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="text-2xl" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/20">
        {/* Medical Disclaimer */}
        <div className="text-center text-white/60 text-sm mb-4">
          <p className="text-white/50 text-xs">
            Content on this site is for informational purposes only and is not medical advice. Always consult a qualified healthcare professional before making changes to your diet or health routine.
          </p>
        </div>

        {/* Privacy & Analytics Notice */}
        <div className="text-center text-white/60 text-sm mb-6">
          <p className="mb-2">
            This website uses analytics to improve your experience. We collect anonymous usage data to understand how visitors interact with our site.
          </p>
          <p className="text-white/50 text-xs">
            No personal information is collected without your consent. By using this site, you agree to our use of analytics cookies.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-white/60">
          © {new Date().getFullYear()} Satwik Farms. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
