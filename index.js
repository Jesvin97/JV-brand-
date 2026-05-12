const express = require('express');
const app = require('./api/leads');

// This helps Vercel's scanner identify the Express application
const main = express();
main.use(app);

module.exports = main;
