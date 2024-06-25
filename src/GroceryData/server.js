const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Proxy middleware
app.use('/products', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
}));

// Campaigns endpoint
app.get('/campaigns', (req, res) => {
  const campaignsPath = path.join(__dirname, 'campaigns.json');
  fs.readFile(campaignsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading campaigns file');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.listen(3003, () => {
  console.log('Proxy server is running on port 3003');
});
