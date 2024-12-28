import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {string} [lastmod]
 * @property {number} [priority]
 * @property {'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'} [changefreq]
 */

// 配置你的网站 URL
const BASE_URL = 'https://tools.bohanzhang.com';

// 定义路由配置
/** @type {Route[]} */
const routes = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/jwt-expire-later', priority: 0.7, changefreq: 'weekly' },
  { path: '/pomodoro-timer', priority: 0.7, changefreq: 'weekly' },
  { path: '/cube-timer', priority: 0.7, changefreq: 'weekly' },
  { path: '/image-generator', priority: 0.7, changefreq: 'weekly' },
  
];

/**
 * @param {Route[]} routes
 * @returns {string}
 */
function generateSitemapXML(routes) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${route.lastmod || today}</lastmod>\n`;
    if (route.changefreq) {
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    }
    if (route.priority) {
      xml += `    <priority>${route.priority}</priority>\n`;
    }
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

// 生成 sitemap
const sitemap = generateSitemapXML(routes);

// 保存 sitemap.xml 文件
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('Sitemap generated successfully!'); 