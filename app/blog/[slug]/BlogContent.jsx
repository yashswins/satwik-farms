'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogContent({ content }) {
  return (
    <div className="prose prose-lg max-w-none
      prose-headings:text-farm-green-primary
      prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h1:mb-6
      prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
      prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
      prose-p:text-text-secondary prose-p:leading-relaxed prose-p:mb-4
      prose-strong:text-farm-green-primary prose-strong:font-semibold
      prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
      prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
      prose-li:text-text-secondary prose-li:mb-2
      prose-a:text-farm-green-bright prose-a:no-underline hover:prose-a:text-farm-green-primary
      prose-blockquote:border-l-4 prose-blockquote:border-farm-green-bright prose-blockquote:pl-4 prose-blockquote:italic
      prose-code:text-farm-green-primary prose-code:bg-farm-cream prose-code:px-2 prose-code:py-1 prose-code:rounded
      prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:overflow-x-auto
      prose-thead:bg-farm-green-primary
      prose-th:bg-farm-green-primary prose-th:text-white prose-th:p-3 prose-th:text-left prose-th:font-semibold
      prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-text-secondary
      prose-tr:border-b prose-tr:border-gray-200
      prose-tbody:divide-y prose-tbody:divide-gray-200
      prose-hr:border-farm-green-bright prose-hr:my-8
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
