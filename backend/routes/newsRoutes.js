const express = require('express');
const https = require('https');
const router = express.Router();

const RSS_SOURCES = [
  {
    name: 'VnExpress - Môi trường',
    url: 'https://vnexpress.net/rss/khoa-hoc-cong-nghe/moi-truong.rss'
  },
  {
    name: 'Tuổi Trẻ - Môi trường',
    url: 'https://tuoitre.vn/rss/thoi-su/moi-truong.rss'
  },
  {
    name: 'VnExpress - Thời sự',
    url: 'https://vnexpress.net/rss/thoi-su.rss',
    filterKeywords: ['ô nhiễm', 'môi trường', 'rác thải', 'nước thải', 'khói bụi', 'đồng tháp', 'cao lãnh', 'kênh rạch', 'xả thải']
  }
];

function fetchXml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchXml(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function decodeHtml(str = '') {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseRssItems(xml, source) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const raw of itemMatches) {
    const titleMatch = raw.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = raw.match(/<description>([\s\S]*?)<\/description>/i);

    const title = decodeHtml(titleMatch ? titleMatch[1] : '');
    const link = decodeHtml(linkMatch ? linkMatch[1] : '');
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    const descRaw = descMatch ? descMatch[1] : '';

    // Tách ảnh thumbnail trong thẻ <description> của RSS VnExpress / Tuổi Trẻ
    const imgMatch = descRaw.match(/<img[^>]+src=["']([^"']+)["']/i);
    const image = imgMatch
      ? imgMatch[1]
      : 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800';

    const summary = decodeHtml(descRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

    if (!title || !link) continue;

    if (source.filterKeywords) {
      const textCheck = `${title} ${summary}`.toLowerCase();
      const matched = source.filterKeywords.some(kw => textCheck.includes(kw));
      if (!matched) continue;
    }

    items.push({
      source: source.name,
      title,
      link,
      summary,
      image,
      pubDate
    });
  }
  return items;
}

router.get('/', async (req, res) => {
  try {
    const results = await Promise.allSettled(
      RSS_SOURCES.map(async (src) => {
        const xml = await fetchXml(src.url);
        return parseRssItems(xml, src);
      })
    );

    let articles = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        articles = articles.concat(r.value);
      }
    }

    // Loại bỏ bài trùng link và sắp xếp mới nhất lên đầu
    const uniqueMap = new Map();
    for (const art of articles) {
      if (!uniqueMap.has(art.link)) {
        uniqueMap.set(art.link, art);
      }
    }

    const sorted = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 12);

    res.json({
      updated_at: new Date().toISOString(),
      total: sorted.length,
      articles: sorted
    });
  } catch (err) {
    res.status(500).json({ message: 'Không tải được RSS báo chí', error: err.message });
  }
});

module.exports = router;