'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogGrid({ blogPosts }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {blogPosts.map((post, idx) => (
        <motion.article
          key={post.slug}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: idx * 0.1 }}
          className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="relative h-48 md:h-56 hover-zoom">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-farm-green-bright text-white px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                {post.category}
              </span>
            </div>
          </div>

          <div className="p-6">
            <p className="text-xs md:text-sm text-text-light mb-2">{post.date}</p>
            <h2 className="text-lg md:text-xl font-bold text-farm-green-primary mb-3">
              {post.title}
            </h2>
            <p className="text-sm md:text-base text-text-secondary mb-4">
              {post.excerpt}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-farm-green-bright hover:text-farm-green-primary font-semibold text-sm md:text-base transition inline-block"
            >
              Read More →
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
