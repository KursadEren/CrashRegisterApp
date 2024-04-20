const express = require('express');
const app = express();
const fs = require('fs');

// Endpoint for data1
app.get('/data1', (req, res) => {
  fs.readFile('Data.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading data1.json');
      return;
    }
    res.json(JSON.parse(data));
  });
});


// Endpoint for data2
app.get('/data2', (req, res) => {
  fs.readFile('Data2.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading data2.json');
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
