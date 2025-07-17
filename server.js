const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API routes
app.get('/api/news', require('./api/news.js'));
app.get('/api/news/tags', require('./api/news/tags.js'));
app.get('/api/news/:slug', require('./api/news/[slug].js'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});