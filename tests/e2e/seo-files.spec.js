const fs = require('fs');
const path = require('path');

describe('SEO files', () => {
  test('sitemap.xml exists and contains valid entries', () => {
    const sitemapPath = path.join(__dirname, '..', '..', 'client', 'public', 'sitemap.xml');
    const content = fs.readFileSync(sitemapPath, 'utf8');

    // Check XML structure
    expect(content).toContain('<urlset');
    expect(content).toContain('</urlset>');

    // Count <url> entries
    const urlMatches = content.match(/<url>/g);
    expect(urlMatches).toHaveLength(28);

    // Check that each entry has loc, priority, changefreq
    const priorityMatches = content.match(/<priority>/g);
    const changefreqMatches = content.match(/<changefreq>/g);
    expect(priorityMatches).toHaveLength(28);
    expect(changefreqMatches).toHaveLength(28);

    // Check some expected URLs
    expect(content).toContain('https://example.com/');
    expect(content).toContain('https://example.com/dashboard');
    expect(content).toContain('https://example.com/favorites');

    // Validate priority values (should be between 0.0 and 1.0)
    const priorityValues = content.match(/<priority>([0-9.]+)<\/priority>/g);
    expect(priorityValues).not.toBeNull();
    priorityValues.forEach(pv => {
      const value = parseFloat(pv.match(/[0-9.]+/)[0]);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    // Validate changefreq values (should be one of the standard values)
    const validChangefreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    const changefreqEntries = content.matchAll(/<changefreq>([a-zA-Z]+)<\/changefreq>/g);
    const changefreqValues = Array.from(changefreqEntries, m => m[1]);
    expect(changefreqValues).toHaveLength(28);
    changefreqValues.forEach(value => {
      expect(validChangefreqs).toContain(value);
    });
  });

  test('robots.txt contains required directives', () => {
    const robotsPath = path.join(__dirname, '..', '..', 'client', 'public', 'robots.txt');
    const content = fs.readFileSync(robotsPath, 'utf8');

    // Required directives
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Allow: /');
    expect(content).toContain('Sitemap:');
    expect(content).toContain('Crawl-delay: 1');
    expect(content).toContain('Disallow: /admin/audit');
    expect(content).toContain('Disallow: /admin/monitoring');
  });
});
