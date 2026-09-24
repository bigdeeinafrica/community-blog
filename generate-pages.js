// Run with: node generate-pages.js
// Creates a crawlable /post/<id>.html page for every post, plus sitemap.xml.
// Re-run this any time you add or edit a post, BEFORE you git add/commit/push.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://community-blog-mu.vercel.app'; // change if your domain changes

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const postsDir = path.join(__dirname, 'posts');
const outDir = path.join(__dirname, 'post');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const index = JSON.parse(fs.readFileSync(path.join(postsDir, 'index.json'), 'utf8'));
const sitemapUrls = [`${SITE_URL}/`];

index.forEach(entry => {
  const post = JSON.parse(fs.readFileSync(path.join(postsDir, `${entry.id}.json`), 'utf8'));
  const url = `${SITE_URL}/post/${post.id}.html`;
  const image = post.image.startsWith('http') ? post.image : `${SITE_URL}/${post.image.replace(/^\//, '')}`;
  const description = post.excerpt || (post.body && post.body[0]) || '';

  const galleryHtml = post.gallery ? `
    <div class="gallery">
      ${post.gallery.map(item => `
        <figure>
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption || '')}" loading="lazy" class="gallery-thumb" data-full="${escapeHtml(item.src)}" data-caption="${escapeHtml(item.caption || '')}" />
          <figcaption>${escapeHtml(item.caption || '')}</figcaption>
        </figure>
      `).join('')}
    </div>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(post.title)} — Remo North Today</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(post.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="Remo North Today" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(post.title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${image}" />

<link rel="stylesheet" href="../style.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
<header class="masthead">
  <div class="masthead-inner">
    <a href="../index.html" class="wordmark">Remo North Today</a>
    <p class="tagline">News from Ward 1 and the wider Remo North community</p>
  </div>
</header>
<main>
  <article class="article">
    <a class="back-link" href="../index.html">&larr; Back to all stories</a>
    <p class="category-marker">${escapeHtml(post.category)}</p>
    <h1>${escapeHtml(post.title)}</h1>
    ${post.subtitle ? `<p class="subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
    <p class="byline">${escapeHtml(post.author)} &middot; ${formatDate(post.date)}${post.location ? ' &middot; ' + escapeHtml(post.location) : ''}</p>
    ${post.poweredBy ? `<p class="powered-by">${escapeHtml(post.poweredBy)}</p>` : ''}
    <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" />
    ${post.imageCaption ? `<p class="image-caption">${escapeHtml(post.imageCaption)}</p>` : ''}
    <div class="body">
      ${post.body.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
    </div>
    ${galleryHtml}
    <button class="share-button" id="share-button" data-url="${url}" data-title="${escapeHtml(post.title)}">Share this story</button>
  </article>
</main>
<footer class="site-footer">
  <p>Remo North Today &mdash; community run coverage of Isara and Remo North LGA, Ogun State.</p>
</footer>
<script src="../post-page.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, `${post.id}.html`), html);
  sitemapUrls.push(url);
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log(`Generated ${index.length} post page(s) and sitemap.xml`);