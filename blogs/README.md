# Blog Management Guide

This folder contains all blog posts for Satwik Farms website. Each blog post is a markdown file (`.md`) with metadata at the top.

## How to Add a New Blog Post

1. **Create a new `.md` file** in this folder with a descriptive filename (use lowercase and hyphens)
   - Example: `my-new-blog-post.md`

2. **Add frontmatter** at the top of the file with metadata:
   ```markdown
   ---
   title: "Your Blog Post Title"
   date: "February 14, 2026"
   category: "Farm Updates"
   image: "/images/your-image.jpg"
   excerpt: "A short description of your blog post that appears in the preview."
   keywords: ["keyword one", "keyword two", "keyword three"]
   ---
   ```

3. **Write your content** below the frontmatter using markdown formatting:
   ```markdown
   # Main Heading

   Your blog post content goes here...

   ## Subheading

   More content...
   ```

4. **Add your image** to the appropriate folder in `/public/images/`

### Categories
Use one of these categories for consistency:
- Farm Updates
- Education
- Events
- Recipes
- Farm Life

### Example Blog Post

Here's a complete example:

```markdown
---
title: "Fresh Tomatoes This Week"
date: "February 14, 2026"
category: "Farm Updates"
image: "/images/farm/tomatoes.jpg"
excerpt: "Our organic tomatoes are ready for harvest. Learn about this week's special varieties."
---

# Fresh Tomatoes This Week

Our organic tomatoes are ready for harvest! This week we have three special varieties available.

## What's Available

- Cherry tomatoes
- Beefsteak tomatoes
- Roma tomatoes

All grown without any chemical residues, straight from our farm to your table.
```

## How to Edit a Blog Post

1. Open the `.md` file you want to edit
2. Make your changes
3. Save the file
4. The website will automatically show the updated content

## How to Remove a Blog Post

Simply delete the `.md` file from this folder. The blog will disappear from the website.

## Adding Images

1. Add your image to `/public/images/farm/` or `/public/images/activities/`
2. Reference it in the frontmatter: `image: "/images/farm/your-image.jpg"`
3. Make sure the image is optimized for web (recommended size: 1200x800px)

## Tips

- **Filename**: Use lowercase letters and hyphens (e.g., `my-blog-post.md`)
- **Date format**: Use full month name (e.g., "February 14, 2026")
- **Excerpt**: Keep it under 160 characters. Write it like a Google search result snippet — describe what the reader will learn, include the main keyword naturally
- **Keywords**: Add 3–6 specific keywords to the frontmatter `keywords` array. Think about what someone would type into Google to find this post (e.g., "residue free vegetables Tanzania", "glycemic index Indian food")
- **Images**: Use high-quality images but compress them for web to ensure fast loading
- **Content**: Write in markdown format - use # for headings, ** for bold, * for italic

## SEO Writing Tips

Good SEO means Google can understand what your post is about and show it to the right people. Follow these guidelines:

- **Title**: Include the main keyword early. E.g., instead of "Our Barley Article", write "Barley for Diabetics: Benefits, GI Values & How to Use It"
- **Content length**: Aim for at least 400–600 words per post. Longer, more thorough posts rank better
- **Use headings (## and ###)**: Break the content into clear sections. Google uses headings to understand the structure
- **Answer a real question**: Think "what is someone Googling?" and answer it directly. E.g., "Is barley good for diabetics?" → write a post that answers it completely
- **Internal links**: Mention and link to related products or other blog posts where relevant
- **Keyword placement**: Use your main keyword in the title, first paragraph, at least one heading, and a few times naturally in the body — but don't force it

## Markdown Formatting Quick Reference

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet point
- Another bullet

1. Numbered list
2. Second item

[Link text](https://example.com)
```

---

For questions or help, check the main project README or contact the development team.
