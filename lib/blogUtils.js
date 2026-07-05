import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogsDirectory = path.join(process.cwd(), 'blogs');

export function getAllBlogSlugs() {
  try {
    const fileNames = fs.readdirSync(blogsDirectory);
    return fileNames
      .filter(fileName => fileName.endsWith('.md') && fileName !== 'README.md')
      .map(fileName => fileName.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading blogs directory:', error);
    return [];
  }
}

export function getBlogBySlug(slug) {
  try {
    const fullPath = path.join(blogsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // dateModified must be an author-declared fact from frontmatter, never the
    // file mtime: Vercel clones the repo fresh on every deploy, so mtime marked
    // every post "modified today" in the sitemap and JSON-LD on each push.
    // Add a `dateModified:` frontmatter field when meaningfully editing a post.
    let dateModified = null;
    try {
      const modifiedSource = data.dateModified || data.date;
      dateModified = modifiedSource
        ? new Date(modifiedSource).toISOString().split('T')[0]
        : null;
    } catch {
      dateModified = null;
    }

    // The page template already renders the frontmatter title as the page <h1>.
    // Strip a leading "# Title" heading from the body so it isn't shown twice
    // (and to avoid emitting a second <h1>, which hurts SEO).
    const body = content.replace(/^\s*#\s[^\n]*\n\s*/, '');

    return {
      slug,
      content: body,
      ...data,
      // After the spread so the normalized ISO date wins over the raw
      // frontmatter string.
      dateModified,
    };
  } catch (error) {
    console.error(`Error reading blog ${slug}:`, error);
    return null;
  }
}

export function getAllBlogs() {
  const slugs = getAllBlogSlugs();
  const blogs = slugs
    .map(slug => getBlogBySlug(slug))
    .filter(blog => blog !== null)
    // Sort blogs by date in descending order
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

  return blogs;
}
