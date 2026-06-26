const site = 'https://produck.fun';

const pages = [
  {
    loc: '/',
    priority: '1.0'
  }
];

export function GET() {
  const urls = pages
    .map(
      (page) => `
  <url>
    <loc>${site}${page.loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml'
      }
    }
  );
}
