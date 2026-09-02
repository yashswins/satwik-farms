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

# Reference Guide for AI Agents (and detail-oriented humans)

These are the established conventions for this blog. Follow them on every new blog and when editing existing ones — they have been validated through past iterations and exist for a reason.

## Image handling rules

### File format
- **Always convert HEIF/AVIF files to real JPEG before committing.** Some `.jpg` files in the repo are mis-extensioned AVIF — verify with `file <path>` or `sharp().metadata()`. Use the `sharp` library (already a project dependency) to convert.
- Example: `await sharp('input.jpg').jpeg({ quality: 85 }).toFile('output.jpg')`

### Inline image sizing (CSS)
- Default inline image height is **820px** (set in `app/blog/[slug]/BlogContent.jsx`). This is too tall for most images.
- **Preferred override: 420px** (`object-fit: cover`) — confirmed as the right size for portrait/medium/landscape photos. Add a CSS override in `BlogContent.jsx` for every inline image.
- Override pattern: `.blog-content img[src*="filename"] { height: 420px !important; object-position: center !important; }`
- Match multiple images in the same blog to the same height so they feel uniform.
- For images that must remain at the larger 820px hero size, no override is needed.

### Infographics with text content
- Infographics need **`object-fit: contain` (not cover) at ~500px**, with a light background — otherwise text gets cropped. Pattern:
  ```css
  .blog-content img[src*="infographic-name"] {
    height: 500px !important;
    object-fit: contain !important;
    background: #f7fafc !important;
  }
  ```
- **Better practice: don't use infographics as images at all.** If an infographic from source material has valuable text/data, extract the text and recreate it as a proper markdown table or bulleted list. Markdown tables render cleanly at any screen size and are SEO-indexable.

### Cover and OG images
- Set the cover via `image: "/images/your-cover.jpg"` in frontmatter. Use a landscape image (e.g. 800x500 or wider).
- **Always generate a separate 1200x630 OG image** — WhatsApp's compact preview cards crop portrait/square images badly, producing huge ugly cards. Use `ogImage: "/images/og-yourpost.jpg"` frontmatter (separate from `image`).
- Generate it with: `sharp(cover).resize(1200, 630, { fit: 'cover', position: 'center' }).jpeg().toFile('og-yourpost.jpg')`

### Other frontmatter image fields
- `hideCoverImage: true` — hides the hero image on the blog page (still shows as grid thumbnail). Useful when the cover is purely for the listing.
- `imagePosition: "40%"` — vertically shifts the hero image focus (e.g. to keep a face/object visible after cropping).
- `imageAlt: "..."` — descriptive alt text for the hero image. Falls back to the post title if omitted, but a richer keyword-aware sentence (what's in the image, the broader topic) ranks better in Google Images and is better for accessibility. Use a 1-line description, not a slogan.

### Freshness field
- `dateModified: "Month D, YYYY"` — set this manually in frontmatter when meaningfully editing a post; it feeds the sitemap lastmod and BlogPosting JSON-LD, falling back to the publish `date` if absent. It is deliberately NOT derived from file mtime (Vercel clones the repo fresh on every deploy, which used to stamp every post "modified today"). Google rewards freshness, so update it on genuine edits only.

### Layout: don't stack images back-to-back
- If a post has only one or two inline images, **space them out** across different sections — not directly under the cover and not adjacent to each other. Body text between images keeps the page readable.

### When the source has many images, pick selectively
- Don't blindly copy every image from a source document. Use only what serves the post: 1–2 hero/inline photos. Extract text from the rest into proper markdown.

---

## Health-claim safety rules

Every blog that makes wellness/health claims must follow these rules. We have done a full audit of the existing blogs to bring them into compliance — new posts must match this baseline.

### Soften definitive treatment claims
- ❌ "Flax seeds reduce LDL cholesterol and lower blood pressure"
- ✅ "Flax seeds **may help** reduce LDL cholesterol and **modestly** lower blood pressure"
- Apply to all health-effect statements: use `may`, `may help`, `can support`, `studied for`, `associated with` — not "cures", "treats", "lowers", "fixes".

### Avoid "ideal for X disease" callouts
- ❌ "**Ideal for:** Diabetes management, insulin resistance, pre-diabetes care"
- ✅ "**A supportive lifestyle drink** — not a substitute for prescribed diabetes treatment. Continue your medication and check with your doctor before adding…"
- Any blog that talks about a medical condition (diabetes, blood pressure, fatty liver, IBS, etc.) must include an **explicit "not a substitute for prescribed treatment"** disclaimer near the relevant section.

### Required precaution sections
For any food/herb with known interactions, include sections covering:
- **Medication Interactions** — call out specifically: diabetes meds (hypoglycaemia risk), blood thinners (omega-3 / vitamin K content), blood-pressure meds, hormonal therapies (HRT, oral contraceptives, tamoxifen for phyto-oestrogen-rich foods)
- **Pregnancy & Breastfeeding** — be explicit about whether *therapeutic* doses are unsafe vs *culinary* amounts being fine. For uterine-active herbs (guava leaf, castor oil, etc.), use "**Avoid during pregnancy** unless cleared by provider."
- **Children** — recommend smaller doses (½–1 tsp instead of 1–2 tbsp) and paediatrician guidance
- **Allergies** — brief mention of cross-reactivity (e.g. guava ↔ latex/birch-pollen) and what to do if a reaction occurs
- **Pre-surgery stop** — for blood-sugar or blood-thinning effects, recommend stopping 2 weeks before any planned surgery

### Acute-symptom claims
- ❌ "Helps manage diarrhoea"
- ✅ "May help ease mild diarrhoea (persistent or severe diarrhoea always needs medical attention)"

### Standard medical disclaimer (use verbatim, adapt the parenthetical)
Every health/wellness blog must end with this disclaimer **before** the Related Reading section:

```markdown
---

*This article is for general educational purposes only and is not a substitute for professional medical advice, diagnosis or treatment. If you have an existing medical condition (especially [list relevant conditions]), or are taking any medication, or are pregnant or breastfeeding, please consult your healthcare provider before making significant changes to your diet.*
```

### Specific known landmines (don't trip these)
- **Honey for infants** — raw honey is **never safe for infants under 12 months** (botulism risk). Any honey blog must include this as a prominent callout, not buried in an FAQ.
- **Raw flax safety** — natural cyanogenic compounds in raw flax are inactivated by **heat (roasting/cooking), not just by grinding**. Don't claim grinding alone is sufficient.
- **Bitter gourd seeds (vicine)** — contraindicated in G6PD deficiency. Mention if the post discusses whole-fruit/seed-inclusive powders.
- **Castor oil, triphala** — uterine effects; contraindicated in pregnancy.
- **Diabetic-supporting foods** (jamun, bitter gourd, guava leaf, barley, multigrain atta) — all need the diabetes-meds hypoglycaemia warning.
- **Fatty-acid ratio framing** — flax has the highest *absolute omega-3 content*, but **hemp's 1:3 ratio is "optimal"** by nutritional standards. Don't claim flax has the "best ratio."

---

## Internal linking rules (Related Reading)

Every blog must end with a **Related Reading** section linking 3–5 contextually relevant posts. This is the single biggest SEO lever for the site (topic-cluster authority).

### Format (use exactly)
```markdown
---

## Related Reading

If you found this helpful, you may also like:

- [Descriptive Keyword-Rich Title](/blog/slug-of-related-post)
- [Another Descriptive Title](/blog/slug-of-related-post-2)
- [Third Title](/blog/slug-of-related-post-3)
```

### Rules
- **3–5 links per blog** — quality over quantity
- **Use descriptive, keyword-rich titles** in the link text — not the raw filename. E.g. `[Bitter Gourd Powder: Benefits for Blood Sugar & Detox]` not `[Bitter Gourd]`
- **Never link a blog to itself**
- **Prioritize topical adjacency** — every blog belongs to one or more clusters; link within the cluster
- **Vary the intro sentence** across blogs — *"If you enjoyed this…"*, *"If you found this helpful…"*, *"Continue exploring…"*, *"More from the Satwik wellness collection…"*. Don't make every blog identical.
- **Insert at the very end** — after any medical disclaimer, separated by `---`

### Existing topic clusters (pick links from these)
- **Diabetes / blood sugar:** barley, multigrain-atta, bitter-gourd-powder, dried-jamun-pulp, dried-jamun-seed-powder, understanding-glycemic-index, guava-leaf-tea
- **Gut / digestion:** gut-health, constipation, triphala, satwik-yoghurt-dahi, flax-seeds, ash-gourd
- **Ayurveda / detox:** triphala, ash-gourd, fatty-liver, bitter-gourd, how-to-charge-water, akshaya-tritiya
- **Dairy / farm:** meet-our-cattle, dairy-process, satwik-paneer, satwik-yoghurt-dahi, satwik-farming-technique
- **Farming / brand:** why-choose-satwik-farms, satwik-farming-technique, benefits-of-residue-free-farming, whats-growing-january, school-trip-success
- **Greens / produce:** microgreens, garden-salad-recipe, whats-growing-january, avocado
- **Seeds / nutrition:** flax-seeds, roasted-seed-mix, satwik-paustik-ladoo

When you create a new blog, also add inbound links to it from 2–3 existing related blogs.

---

## Workflow conventions

### Dev server
- The dev server typically already runs on `http://localhost:3000`. Check before starting another (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`).
- Always preview new/changed blogs at `http://localhost:3000/blog/<slug>` before committing.

### Source documents (.docx)
- When given a source `.docx`, extract text from `word/document.xml` after unzipping. Don't commit the source `.docx` to the repo.
- If the docx contains infographics with valuable text, **extract the text into markdown tables** rather than embedding the images.

### Commit hygiene
- Stage files specifically — avoid `git add .` or `git add -A` to prevent accidentally committing leftover originals/temp files (other untracked images, `.docx` source files, etc.).
- Group related changes per commit. A typical "new blog" commit covers: the new `.md`, the cover/OG/inline images, and any `BlogContent.jsx` CSS overrides for the new images.

---

For questions or help, check the main project README or contact the development team.
