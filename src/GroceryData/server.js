const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

app.use('/product', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

app.listen(3002, () => {
  console.log('Proxy server is running on port 3002');
});
