'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogContent({ content }) {
  return (
    <article className="blog-content">
      <style jsx global>{`
        .blog-content {
          line-height: 1.8;
        }

        /* Headings */
        .blog-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d5016;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .blog-content h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #2d5016;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          line-height: 1.3;
        }

        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d5016;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        /* Paragraphs */
        .blog-content p {
          font-size: 1.125rem;
          color: #4a5568;
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        /* Strong/Bold */
        .blog-content strong,
        .blog-content b {
          font-weight: 700;
          color: #2d5016;
        }

        /* Emphasis/Italic */
        .blog-content em {
          font-style: italic;
          color: #2d5016;
        }

        /* Lists */
        .blog-content ul,
        .blog-content ol {
          margin: 2rem 0;
          padding-left: 2rem;
        }

        .blog-content ul {
          list-style-type: disc;
        }

        .blog-content ol {
          list-style-type: decimal;
        }

        .blog-content li {
          font-size: 1.125rem;
          color: #4a5568;
          margin-bottom: 1rem;
          line-height: 1.8;
          padding-left: 0.5rem;
        }

        .blog-content li::marker {
          color: #6fb83c;
          font-weight: 600;
        }

        .blog-content ul ul,
        .blog-content ol ol {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }

        /* Tables */
        .blog-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 3rem 0;
          font-size: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .blog-content thead {
          background: #2d5016;
        }

        .blog-content th {
          background: #2d5016;
          color: white;
          font-weight: 600;
          text-align: left;
          padding: 1rem 1.25rem;
          border-bottom: 2px solid #6fb83c;
          font-size: 1rem;
          white-space: nowrap;
        }

        .blog-content td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          color: #4a5568;
          line-height: 1.6;
          vertical-align: top;
        }

        .blog-content tbody tr {
          background: white;
          transition: background-color 0.2s;
        }

        .blog-content tbody tr:hover {
          background: #f7fafc;
        }

        .blog-content tbody tr:last-child td {
          border-bottom: none;
        }

        /* Make tables responsive */
        @media (max-width: 768px) {
          .blog-content table {
            font-size: 0.875rem;
          }

          .blog-content th,
          .blog-content td {
            padding: 0.75rem;
          }
        }

        /* Links */
        .blog-content a {
          color: #6fb83c;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .blog-content a:hover {
          color: #2d5016;
          text-decoration: underline;
        }

        /* Blockquotes */
        .blog-content blockquote {
          border-left: 4px solid #6fb83c;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #4a5568;
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 0.25rem;
        }

        /* Code */
        .blog-content code {
          background: #f0f4e8;
          color: #2d5016;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .blog-content pre {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .blog-content pre code {
          background: transparent;
          padding: 0;
        }

        /* Images */
        .blog-content img {
          width: 100% !important;
          height: 820px !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          margin: 2rem auto !important;
          border-radius: 0.75rem !important;
        }

        .blog-content p:has(> img) {
          margin: 0;
          padding: 0;
          line-height: 0;
        }

        .blog-content img[src*="why-satwik-2"] {
          height: 600px !important;
          object-position: center !important;
        }

        .blog-content img[src*="neem-leaf"],
        .blog-content img[src*="tulsi-leaf"] {
          height: 420px !important;
          object-position: center !important;
        }

        .blog-content img[src*="yoghurt2-conv"] {
          height: 480px !important;
          object-position: center !important;
        }

        .blog-content img[src*="gut1"],
        .blog-content img[src*="gut2"],
        .blog-content img[src*="triphala1-conv"],
        .blog-content img[src*="avocado-oil-conv"],
        .blog-content img[src*="ash-gourd-juice-conv"],
        .blog-content img[src*="bitter-gourd2-conv"],
        .blog-content img[src*="farming-conv"],
        .blog-content img[src*="farming3-conv"],
        .blog-content img[src*="microgreen-conv"],
        .blog-content img[src*="guava2-conv"],
        .blog-content img[src*="coconut-oil-conv"],
        .blog-content img[src*="ghee-product"],
        .blog-content img[src*="ghee-diabetes-meal"] {
          height: 420px !important;
          object-position: center !important;
        }

        /* Text-bearing designed graphics — contain so titles/logos are not cropped */
        .blog-content img[src*="weight-loss-ingredients"],
        .blog-content img[src*="grounding2-conv"] {
          height: 420px !important;
          object-fit: contain !important;
          background: #f7fafc !important;
        }

        /* Coconut blog — branded product image: contain so text is not cropped */
        .blog-content img[src*="coconut-oil-main"] {
          height: 460px !important;
          object-fit: contain !important;
          background: #fdf8ee !important;
        }

        /* Flax seeds blog — photo uses cover crop at 420px */
        .blog-content img[src*="flax1"] {
          height: 420px !important;
          object-position: center !important;
        }

        /* Horizontal Rule */
        .blog-content hr {
          border: none;
          border-top: 2px solid #6fb83c;
          margin: 3rem 0;
        }

        /* First paragraph after heading */
        .blog-content h1 + p,
        .blog-content h2 + p,
        .blog-content h3 + p {
          margin-top: 1rem;
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
