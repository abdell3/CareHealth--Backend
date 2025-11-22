require('dotenv').config();
const express = require('express');
const routes = require('./routes/index');
const { initializeRedis } = require('./config/redis');

const app = express();

initializeRedis().catch((err) => {
  console.error('Redis initialization error:', err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

module.exports = app;

