const { XMLParser } = require('fast-xml-parser');

const news = require('./data/news.json');
const sources = require('./data/sources.json');
const tags = require('./data/tags.json');
const categories = require('./data/categories.json');
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const qs = require('qs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const xmlFilePath = path.join(__dirname, './data/rss-news.xml');
const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');

const parser = new XMLParser();
const rssNews = parser.parse(xmlData);

router.get('/api/news', async (req, res) => {
  await sleep(500);
  let result = news;
  const { categories = [], sources = [] } = qs.parse(req.query);

  if (categories.length > 0) {
    const tt = typeof categories === 'string' ? [categories] : categories;
    result = result.filter((newsItem) =>
      tt.some((cat) => newsItem.category.includes(cat))
    );
  }
  if (sources.length > 0) {
    result = result.filter((newsItem) => sources.includes(newsItem.source));
  }

  res.send(result);
});

router.get('/api/news/:id', async (req, res) => {
  await sleep(500);

  const newsId = parseInt(req.params.id, 10);

  const newsItem = news.find((item) => item.id === newsId);

  if (newsItem) {
    res.send(newsItem);
  } else {
    res.status(404).send({ message: 'Новость не найдена' });
  }
});

router.get('/api/relatedNews/:id', async (req, res) => {
  await sleep(500);

  const newsId = parseInt(req.params.id, 10);

  const newsItem = news.find((item) => item.id === newsId);

  if (newsItem) {
    const relatedNewsIds = newsItem.related;
    const relatedNews = news.filter((item) => relatedNewsIds.includes(item.id));

    res.send(relatedNews);
  } else {
    res.send([]);
  }
});

router.get('/api/news/search', async (req, res) => {
  await sleep(500);
  const { title_like } = req.query;
  
  if (title_like) {
    const filteredNews = news
      .filter((newsItem) =>
        newsItem.title.toLowerCase().includes(title_like.toLowerCase())
      )
      .map((data) => ({ id: data.id, title: data.title }));
    return res.send(filteredNews);
  }

  res.send([]);
});

router.get('/api/rss-news', async (req, res) => {
  res.send(rssNews);
});

router.get('/api/sources', async (req, res) => {
  res.send(sources);
});

router.get('/api/tags', async (req, res) => {
  res.send(tags);
});

router.get('/api/categories', async (req, res) => {
  res.send(categories);
});

module.exports = router;
