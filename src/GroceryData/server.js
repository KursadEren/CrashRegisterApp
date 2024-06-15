const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

app.use('/products', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
}));

app.listen(3003, () => {
  console.log('Proxy server is running on port 3003');
});
