require('dotenv').config();
const express = require('express');
const routes = require('./routes/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

module.exports = app;

