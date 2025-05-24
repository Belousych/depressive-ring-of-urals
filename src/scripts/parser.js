const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const download = require('image-downloader');
const https = require('https');
const xml2js = require('xml2js');

const RSS_URL = 'https://rsshub.app/telegram/channel/ring_of_the_urals';
const DATA_FILE = path.join(__dirname, '../_data/photos.json');
const MAX_POSTS = 100;

async function parseTelegram() {
  const parser = new Parser({
    customFields: {
      item: ['content', 'contentSnippet']
    },
    xml2js: {
      strict: false,
      normalizeTags: true
    }
  });

  function fetchRawXML(url) {
    return new Promise((resolve, reject) => {
      https.get(url, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  let feed;
  try {
    feed = await parser.parseURL(RSS_URL);
  } catch (err) {
    console.error('Ошибка при получении RSS стандартным парсером:', err);
    // Попробуем получить и распарсить XML вручную
    try {
      const xml = await fetchRawXML(RSS_URL);
      const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });
      const items = parsed.rss && parsed.rss.channel && parsed.rss.channel.item ? parsed.rss.channel.item : [];
      let posts = [];
      for (const item of Array.isArray(items) ? items : [items]) {
        try {
          const content = item.description || item.content || '';
          const images = (content.match(/https:\/\/[^"']+\.(jpg|jpeg|png)/gi) || []).filter(Boolean);
          const tags = (content.match(/#\w+/g) || []).map(tag => tag.slice(1));
          posts.push({
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('ru-RU') : '',
            media: images,
            caption: item.title || '',
            tags: tags
          });
        } catch (err) {
          console.warn('Ошибка при обработке поста (ручной парсинг):', err);
          continue;
        }
      }
      posts = posts
        .filter(post => post.media.length > 0)
        .sort((a, b) => {
          const dA = a.date.split('.').reverse().join('-');
          const dB = b.date.split('.').reverse().join('-');
          return new Date(dB) - new Date(dA);
        })
        .slice(0, MAX_POSTS);
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ posts }, null, 2));
        console.log(`(xml2js) Updated ${posts.length} posts in ${DATA_FILE}`);
      } catch (err) {
        console.error('Ошибка при сохранении файла (xml2js):', err);
      }
    } catch (e) {
      console.error('Ошибка при ручном парсинге XML:', e);
    }
    return;
  }

  let posts = [];
  for (const item of feed.items || []) {
    try {
      if (!item || !item.content || !item.isoDate) continue;
      const images = (item.content.match(/https:\/\/[^"']+\.(jpg|jpeg|png)/gi) || []).filter(Boolean);
      const tags = (item.content.match(/#\w+/g) || []).map(tag => tag.slice(1));
      posts.push({
        date: new Date(item.isoDate).toLocaleDateString('ru-RU'),
        media: images,
        caption: item.contentSnippet || '',
        tags: tags
      });
    } catch (err) {
      console.warn('Ошибка при обработке поста:', err);
      continue;
    }
  }

  // Limit to MAX_POSTS and sort by date
  posts = posts
    .filter(post => post.media.length > 0)
    .sort((a, b) => {
      const dA = a.date.split('.').reverse().join('-');
      const dB = b.date.split('.').reverse().join('-');
      return new Date(dB) - new Date(dA);
    })
    .slice(0, MAX_POSTS);

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ posts }, null, 2));
    console.log(`Updated ${posts.length} posts in ${DATA_FILE}`);
  } catch (err) {
    console.error('Ошибка при сохранении файла:', err);
  }
}

parseTelegram().catch(console.error);
